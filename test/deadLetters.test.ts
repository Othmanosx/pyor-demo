import { describe, expect, it } from 'vitest';
import { DeadLetterStore } from '../src/webhooks/deadLetters.js';
import type { Delivery } from '../src/webhooks/types.js';

const delivery = (id: string): Delivery => ({
  id,
  endpointId: 'ep_1',
  event: 'order.paid',
  payload: { id },
  status: 'dead',
  attempts: 5,
  lastError: 'receiver responded 503',
  createdAt: 1000,
});

describe('DeadLetterStore', () => {
  it('stores a failed delivery with the time it gave up', () => {
    const store = new DeadLetterStore(10);
    store.add(delivery('d1'), 5000);
    expect(store.get('d1')).toMatchObject({ status: 'dead', failedAt: 5000, attempts: 5 });
  });

  it('drops the oldest entries past the limit', () => {
    const store = new DeadLetterStore(2);
    ['d1', 'd2', 'd3'].forEach((id) => store.add(delivery(id)));
    expect(store.list().map((letter) => letter.id)).toEqual(['d2', 'd3']);
  });

  it('removes an entry once', () => {
    const store = new DeadLetterStore(10);
    store.add(delivery('d1'));
    expect(store.remove('d1')).toBe(true);
    expect(store.remove('d1')).toBe(false);
  });
});
