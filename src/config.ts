import type { RetryPolicy } from './webhooks/retry.js';

export interface Config {
  port: number;
  deliveryTimeoutMs: number;
  retry: RetryPolicy;
  deadLetterLimit: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 3000),
    deliveryTimeoutMs: Number(env.DELIVERY_TIMEOUT_MS ?? 5000),
    retry: {
      maxAttempts: Number(env.RETRY_MAX_ATTEMPTS ?? 5),
      baseDelayMs: Number(env.RETRY_BASE_MS ?? 500),
      maxDelayMs: Number(env.RETRY_MAX_MS ?? 30_000),
    },
    deadLetterLimit: Number(env.DEAD_LETTER_LIMIT ?? 1000),
  };
}
