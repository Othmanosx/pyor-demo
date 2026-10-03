export interface Config {
  port: number;
  deliveryTimeoutMs: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 3000),
    deliveryTimeoutMs: Number(env.DELIVERY_TIMEOUT_MS ?? 5000),
  };
}
