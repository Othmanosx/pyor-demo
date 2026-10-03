import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/router.js';
import { EndpointStore } from '../src/webhooks/endpoints.js';

const config = { port: 0, deliveryTimeoutMs: 1000 };
const receiver = vi.fn<typeof fetch>();
let app: ReturnType<typeof createApp>;
let base: string;

const call = (path: string, init?: RequestInit) => fetch(`${base}${path}`, init);
const post = (path: string, body: unknown) =>
  call(path, { method: 'POST', body: JSON.stringify(body) });

beforeEach(async () => {
  receiver.mockReset().mockResolvedValue(new Response(null, { status: 200 }));
  app = createApp({ config, endpoints: new EndpointStore(), fetch: receiver });
  await new Promise<void>((resolve) => app.listen(0, resolve));
  base = `http://127.0.0.1:${(app.address() as AddressInfo).port}`;
});

afterEach(() => new Promise<void>((resolve) => app.close(() => resolve())));

describe('endpoints', () => {
  it('creates one and reveals the secret only once', async () => {
    const created = await (await post('/endpoints', { url: 'https://a.test/h', events: ['x'] })).json();
    expect(created.secret).toMatch(/^whsec_/);

    const listed = await (await call('/endpoints')).json();
    expect(listed.endpoints).toEqual([{ id: created.id, url: 'https://a.test/h', events: ['x'] }]);
  });

  it('rejects an invalid body', async () => {
    const res = await post('/endpoints', { url: 'nope', events: [] });
    expect(res.status).toBe(400);
  });

  it('deletes an endpoint and 404s the second time', async () => {
    const { id } = await (await post('/endpoints', { url: 'https://a.test/h', events: ['x'] })).json();
    expect((await call(`/endpoints/${id}`, { method: 'DELETE' })).status).toBe(200);
    expect((await call(`/endpoints/${id}`, { method: 'DELETE' })).status).toBe(404);
  });
});

describe('events', () => {
  it('delivers to every matching endpoint', async () => {
    await post('/endpoints', { url: 'https://a.test/h', events: ['order.paid'] });
    await post('/endpoints', { url: 'https://b.test/h', events: ['order.paid'] });
    await post('/endpoints', { url: 'https://c.test/h', events: ['order.refunded'] });

    const res = await post('/events', { event: 'order.paid', payload: { id: 1 } });
    const { deliveries } = await res.json();
    expect(res.status).toBe(202);
    expect(deliveries).toHaveLength(2);
    expect(receiver).toHaveBeenCalledTimes(2);
  });

  it('rejects an event without a name', async () => {
    expect((await post('/events', { payload: {} })).status).toBe(400);
  });

  it('answers 404 for unknown routes', async () => {
    expect((await call('/nope')).status).toBe(404);
  });
});
