import { randomUUID } from 'node:crypto';
import { sign } from './sign.js';
import type { Delivery, Fetcher, Endpoint } from './types.js';

export interface DeliverOptions {
  fetch?: Fetcher;
  timeoutMs: number;
  now?: () => number;
}

interface AttemptResult {
  ok: boolean;
  status?: number;
  error?: string;
}

function buildHeaders(
  endpoint: Endpoint,
  event: string,
  body: string,
  timestamp: number,
): Record<string, string> {
  return {
    'content-type': 'application/json',
    'x-relay-event': event,
    'x-relay-timestamp': String(timestamp),
    'x-relay-signature': sign(endpoint.secret, body, timestamp),
  };
}

async function attempt(
  endpoint: Endpoint,
  event: string,
  body: string,
  timestamp: number,
  opts: DeliverOptions,
): Promise<AttemptResult> {
  const doFetch = opts.fetch ?? fetch;
  try {
    const res = await doFetch(endpoint.url, {
      method: 'POST',
      headers: buildHeaders(endpoint, event, body, timestamp),
      body,
      signal: AbortSignal.timeout(opts.timeoutMs),
    });
    return res.ok ? { ok: true, status: res.status } : { ok: false, status: res.status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deliver(
  endpoint: Endpoint,
  event: string,
  payload: unknown,
  opts: DeliverOptions,
): Promise<Delivery> {
  const now = opts.now ?? Date.now;
  const timestamp = now();
  const delivery: Delivery = {
    id: randomUUID(),
    endpointId: endpoint.id,
    event,
    payload,
    status: 'pending',
    attempts: 0,
    createdAt: timestamp,
  };

  const result = await attempt(endpoint, event, JSON.stringify(payload), timestamp, opts);
  delivery.attempts = 1;
  delivery.status = result.ok ? 'delivered' : 'failed';
  if (!result.ok) {
    delivery.lastError = result.error ?? `receiver responded ${result.status}`;
  }
  return delivery;
}
