import { describe, expect, it, vi } from 'vitest';
import { backoffDelay, withRetry } from '../src/webhooks/retry.js';

const policy = { maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 250 };
const fail = { ok: false, status: 500 };
const pass = { ok: true, status: 200 };

describe('backoffDelay', () => {
  it('doubles each attempt and stops at the cap', () => {
    expect([1, 2, 3, 4].map((attempt) => backoffDelay(attempt, policy))).toEqual([100, 200, 250, 250]);
  });
});

describe('withRetry', () => {
  it('returns after the first success without sleeping', async () => {
    const sleep = vi.fn(async () => {});
    const outcome = await withRetry(async () => pass, policy, sleep);
    expect(outcome).toEqual({ result: pass, attempts: 1 });
    expect(sleep).not.toHaveBeenCalled();
  });

  it('sleeps between attempts and gives up after maxAttempts', async () => {
    const sleep = vi.fn(async () => {});
    const run = vi.fn(async () => fail);
    const outcome = await withRetry(run, policy, sleep);
    expect(outcome).toEqual({ result: fail, attempts: 3 });
    expect(sleep.mock.calls).toEqual([[100], [200]]);
  });

  it('stops as soon as an attempt succeeds', async () => {
    const run = vi.fn().mockResolvedValueOnce(fail).mockResolvedValueOnce(pass);
    const outcome = await withRetry(run, policy, async () => {});
    expect(outcome.attempts).toBe(2);
  });
});
