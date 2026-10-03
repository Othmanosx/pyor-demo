import { describe, expect, it } from 'vitest';
import { EndpointStore } from '../src/webhooks/endpoints.js';

describe('EndpointStore', () => {
  it('generates an id and a secret on add', () => {
    const endpoint = new EndpointStore().add({ url: 'https://a.test/hook', events: ['order.paid'] });
    expect(endpoint.id).toBeTruthy();
    expect(endpoint.secret).toMatch(/^whsec_[0-9a-f]{48}$/);
  });

  it('finds endpoints by event', () => {
    const store = new EndpointStore();
    const paid = store.add({ url: 'https://a.test/hook', events: ['order.paid'] });
    store.add({ url: 'https://b.test/hook', events: ['order.refunded'] });
    expect(store.forEvent('order.paid')).toEqual([paid]);
  });

  it('removes an endpoint once', () => {
    const store = new EndpointStore();
    const endpoint = store.add({ url: 'https://a.test/hook', events: ['x'] });
    expect(store.remove(endpoint.id)).toBe(true);
    expect(store.remove(endpoint.id)).toBe(false);
  });
});
