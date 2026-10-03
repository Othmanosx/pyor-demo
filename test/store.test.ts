import { describe, expect, it } from 'vitest';
import { SubscriptionStore } from '../src/webhooks/store.js';

describe('SubscriptionStore', () => {
  it('generates an id and a secret on add', () => {
    const sub = new SubscriptionStore().add({ url: 'https://a.test/hook', events: ['order.paid'] });
    expect(sub.id).toBeTruthy();
    expect(sub.secret).toMatch(/^whsec_[0-9a-f]{48}$/);
  });

  it('finds subscriptions by event', () => {
    const store = new SubscriptionStore();
    const paid = store.add({ url: 'https://a.test/hook', events: ['order.paid'] });
    store.add({ url: 'https://b.test/hook', events: ['order.refunded'] });
    expect(store.forEvent('order.paid')).toEqual([paid]);
  });

  it('removes a subscription once', () => {
    const store = new SubscriptionStore();
    const sub = store.add({ url: 'https://a.test/hook', events: ['x'] });
    expect(store.remove(sub.id)).toBe(true);
    expect(store.remove(sub.id)).toBe(false);
  });
});
