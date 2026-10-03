import { describe, expect, it, vi } from 'vitest';
import { createDelivery, deliver } from '../src/webhooks/deliver.js';
import { verify } from '../src/webhooks/sign.js';
import type { Endpoint } from '../src/webhooks/types.js';

const endpoint: Endpoint = {
  id: 'ep_1',
  url: 'https://receiver.test/hook',
  events: ['order.paid'],
  secret: 'whsec_test',
};

const retry = { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 100 };
const sleep = vi.fn(async () => {});

const respond = (...statuses: number[]) => {
  const fetch = vi.fn<typeof fetch>();
  statuses.forEach((status) => fetch.mockResolvedValueOnce(new Response(null, { status })));
  return fetch;
};

const run = (fetch: typeof globalThis.fetch, payload: unknown = {}) =>
  deliver(endpoint, createDelivery(endpoint, 'order.paid', payload, () => 1000), {
    fetch,
    timeoutMs: 1000,
    retry,
    sleep,
  });

describe('deliver', () => {
  it('posts a signed body and marks the delivery delivered', async () => {
    const fetch = respond(200);
    const delivery = await run(fetch, { id: 7 });

    const [url, init] = fetch.mock.calls[0]!;
    const headers = init?.headers as Record<string, string>;
    expect(url).toBe(endpoint.url);
    expect(verify(endpoint.secret, '{"id":7}', 1000, headers['x-relay-signature']!)).toBe(true);
    expect(delivery).toMatchObject({ status: 'delivered', attempts: 1 });
  });

  it('retries a 503 and succeeds on the second attempt', async () => {
    const fetch = respond(503, 200);
    expect(await run(fetch)).toMatchObject({ status: 'delivered', attempts: 2 });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('marks the delivery dead once attempts run out', async () => {
    const fetch = respond(503, 503, 503);
    const delivery = await run(fetch);
    expect(delivery).toMatchObject({
      status: 'dead',
      attempts: 3,
      lastError: 'receiver responded 503',
    });
  });

  it('retries a network error', async () => {
    const fetch = vi.fn<typeof fetch>().mockRejectedValue(new Error('ECONNREFUSED'));
    const delivery = await run(fetch);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(delivery).toMatchObject({ status: 'dead', lastError: 'ECONNREFUSED' });
  });
});
