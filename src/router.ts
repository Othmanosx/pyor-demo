import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import type { Config } from './config.js';
import { readBody, send } from './lib/http.js';
import { deliver } from './webhooks/deliver.js';
import type { SubscriptionStore } from './webhooks/store.js';
import type { Fetcher, Subscription } from './webhooks/types.js';

export interface Deps {
  config: Config;
  subscriptions: SubscriptionStore;
  fetch?: Fetcher;
}

interface Ctx {
  req: IncomingMessage;
  res: ServerResponse;
  deps: Deps;
}

type Handler = (ctx: Ctx, params: string[]) => Promise<void> | void;

const publicView = ({ id, url, events }: Subscription) => ({ id, url, events });

function parseSubscription(body: unknown): Pick<Subscription, 'url' | 'events'> | string {
  if (typeof body !== 'object' || body === null) return 'body must be a JSON object';
  const { url, events } = body as { url?: unknown; events?: unknown };
  if (typeof url !== 'string' || !URL.canParse(url)) return 'url must be a valid URL';
  const valid =
    Array.isArray(events) &&
    events.length > 0 &&
    events.every((e): e is string => typeof e === 'string');
  return valid ? { url, events } : 'events must be a non-empty array of strings';
}

function listSubscriptions({ res, deps }: Ctx): void {
  send(res, 200, { subscriptions: deps.subscriptions.list().map(publicView) });
}

async function createSubscription({ req, res, deps }: Ctx): Promise<void> {
  const input = parseSubscription(await readBody(req));
  if (typeof input === 'string') return send(res, 400, { error: input });
  const sub = deps.subscriptions.add(input);
  send(res, 201, { ...publicView(sub), secret: sub.secret });
}

function deleteSubscription({ res, deps }: Ctx, [id = '']: string[]): void {
  const removed = deps.subscriptions.remove(id);
  send(res, removed ? 200 : 404, removed ? { ok: true } : { error: 'subscription not found' });
}

async function postEvent({ req, res, deps }: Ctx): Promise<void> {
  const body = await readBody(req);
  const { event, payload } = (body ?? {}) as { event?: unknown; payload?: unknown };
  if (typeof event !== 'string' || event === '') {
    return send(res, 400, { error: 'event must be a non-empty string' });
  }
  const deliveries = await Promise.all(
    deps.subscriptions
      .forEvent(event)
      .map((sub) =>
        deliver(sub, event, payload, { fetch: deps.fetch, timeoutMs: deps.config.deliveryTimeoutMs }),
      ),
  );
  send(res, 202, {
    deliveries: deliveries.map(({ id, subscriptionId, status, attempts }) => ({
      id,
      subscriptionId,
      status,
      attempts,
    })),
  });
}

const routes: [method: string, pattern: RegExp, handler: Handler][] = [
  ['GET', /^\/subscriptions$/, listSubscriptions],
  ['POST', /^\/subscriptions$/, createSubscription],
  ['DELETE', /^\/subscriptions\/([\w-]+)$/, deleteSubscription],
  ['POST', /^\/events$/, postEvent],
];

async function route(req: IncomingMessage, res: ServerResponse, deps: Deps): Promise<void> {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  const match = routes.flatMap(([method, pattern, handler]) => {
    const found = method === req.method ? pattern.exec(pathname) : null;
    return found ? [{ handler, params: found.slice(1) }] : [];
  })[0];
  if (!match) return send(res, 404, { error: 'not found' });
  await match.handler({ req, res, deps }, match.params);
}

export function createApp(deps: Deps): Server {
  return createServer((req, res) => {
    route(req, res, deps).catch((err: unknown) => {
      console.error(err);
      send(res, 500, { error: 'internal error' });
    });
  });
}
