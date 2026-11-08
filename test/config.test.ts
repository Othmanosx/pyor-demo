import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  it('falls back to the defaults', () => {
    expect(loadConfig({})).toEqual({ port: 3000, deliveryTimeoutMs: 5000 });
  });

  it('reads the environment', () => {
    expect(loadConfig({ PORT: '8080', DELIVERY_TIMEOUT_MS: '2000' })).toEqual({ port: 8080, deliveryTimeoutMs: 2000 });
  });

  it('throws on a value that is not a positive integer', () => {
    expect(() => loadConfig({ PORT: 'eighty' })).toThrow(/PORT must be a positive integer/);
    expect(() => loadConfig({ DELIVERY_TIMEOUT_MS: '-5' })).toThrow(/DELIVERY_TIMEOUT_MS/);
  });
});
