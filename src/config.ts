export interface Config {
  port: number;
  deliveryTimeoutMs: number;
}

function positiveInt(env: NodeJS.ProcessEnv, name: string, fallback: number): number {
  const raw = env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, got "${raw}"`);
  }
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: positiveInt(env, 'PORT', 3000),
    deliveryTimeoutMs: positiveInt(env, 'DELIVERY_TIMEOUT_MS', 5000),
  };
}
