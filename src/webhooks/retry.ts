import { setTimeout as delay } from 'node:timers/promises';
import type { AttemptResult } from './types.js';

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export type Sleep = (ms: number) => Promise<unknown>;

export interface RetryOutcome {
  result: AttemptResult;
  attempts: number;
}

export const backoffDelay = (attempt: number, { baseDelayMs, maxDelayMs }: RetryPolicy): number =>
  Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);

export const shouldRetry = (result: AttemptResult): boolean => !result.ok;

export function withRetry(
  run: () => Promise<AttemptResult>,
  policy: RetryPolicy,
  sleep: Sleep = delay,
): Promise<RetryOutcome> {
  const step = async (attempt: number): Promise<RetryOutcome> => {
    const result = await run();
    if (!shouldRetry(result) || attempt >= policy.maxAttempts) return { result, attempts: attempt };
    await sleep(backoffDelay(attempt, policy));
    return step(attempt + 1);
  };
  return step(1);
}
