import { describe, expect, it, vi } from 'vitest';
import { deliver } from '../src/webhooks/deliver.js';
import { verify } from '../src/webhooks/sign.js';
import type { Subscription } from '../src/webhooks/types.js';

const sub: Subscription = {
  id: 'sub_1',
  url: 'https://receiver.test/hook',
  events: ['order.paid'],
  secret: 'whsec_test',
};

const respond = (status: number) =>
  vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status }));

describe('deliver', () => {
  it('posts a signed body and marks the delivery delivered', async () => {
    const fetch = respond(200);
    const delivery = await deliver(sub, 'order.paid', { id: 7 }, { fetch, timeoutMs: 1000, now: () => 1000 });

    const [url, init] = fetch.mock.calls[0]!;
    const headers = init?.headers as Record<string, string>;
    expect(url).toBe(sub.url);
    expect(verify(sub.secret, '{"id":7}', 1000, headers['x-relay-signature']!)).toBe(true);
    expect(delivery).toMatchObject({ status: 'delivered', attempts: 1 });
  });

  it('marks a non-2xx response as failed', async () => {
    const delivery = await deliver(sub, 'order.paid', {}, { fetch: respond(503), timeoutMs: 1000 });
    expect(delivery).toMatchObject({ status: 'failed', lastError: 'receiver responded 503' });
  });

  it('marks a network error as failed', async () => {
    const fetch = vi.fn<typeof fetch>().mockRejectedValue(new Error('ECONNREFUSED'));
    const delivery = await deliver(sub, 'order.paid', {}, { fetch, timeoutMs: 1000 });
    expect(delivery).toMatchObject({ status: 'failed', lastError: 'ECONNREFUSED' });
  });
});
