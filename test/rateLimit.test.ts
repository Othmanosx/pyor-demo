import { describe, expect, it } from 'vitest';
import { createRateLimiter } from '../src/webhooks/rateLimit.js';

describe('createRateLimiter', () => {
  it('allows ten deliveries a second per endpoint', () => {
    const limiter = createRateLimiter();
    const results = Array.from({ length: 11 }, () => limiter.take('ep_1', 0));
    expect(results.filter(Boolean)).toHaveLength(10);
  });

  it('opens a new window after a second', () => {
    const limiter = createRateLimiter();
    Array.from({ length: 10 }, () => limiter.take('ep_1', 0));
    expect(limiter.take('ep_1', 1000)).toBe(true);
  });

  it('counts each endpoint on its own', () => {
    const limiter = createRateLimiter();
    Array.from({ length: 10 }, () => limiter.take('ep_1', 0));
    expect(limiter.take('ep_2', 0)).toBe(true);
  });
});
