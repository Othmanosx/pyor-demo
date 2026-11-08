import { randomUUID } from 'node:crypto';
import { type RetryPolicy, type Sleep, withRetry } from './retry.js';
import { sign } from './sign.js';
import type { AttemptResult, Delivery, Endpoint, Fetcher } from './types.js';

export interface DeliverOptions {
  fetch?: Fetcher;
  timeoutMs: number;
  retry: RetryPolicy;
  sleep?: Sleep;
  now?: () => number;
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

export function createDelivery(
  endpoint: Endpoint,
  event: string,
  payload: unknown,
  now: () => number = Date.now,
): Delivery {
  return {
    id: randomUUID(),
    endpointId: endpoint.id,
    event,
    payload,
    status: 'pending',
    attempts: 0,
    createdAt: now(),
  };
}

export async function deliver(
  endpoint: Endpoint,
  delivery: Delivery,
  opts: DeliverOptions,
): Promise<Delivery> {
  const body = JSON.stringify(delivery.payload);
  const now = opts.now ?? Date.now;
  const { result, attempts } = await withRetry(
    () => attempt(endpoint, delivery.event, body, now(), opts),
    opts.retry,
    opts.sleep,
  );
  if (result.ok) return { ...delivery, status: 'delivered', attempts };
  return {
    ...delivery,
    status: 'dead',
    attempts,
    lastError: result.error ?? `receiver responded ${result.status}`,
  };
}
