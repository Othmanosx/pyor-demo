import { describe, expect, it, vi } from 'vitest';
import { jsonLogger } from '../src/lib/logger.js';

describe('jsonLogger', () => {
  it('writes one JSON object per line with a timestamp', () => {
    const write = vi.fn();
    jsonLogger(write)({ level: 'info', msg: 'request', status: 200 });

    const [text] = write.mock.calls[0]!;
    expect(text.endsWith('\n')).toBe(true);
    expect(JSON.parse(text)).toMatchObject({ level: 'info', msg: 'request', status: 200 });
    expect(JSON.parse(text).time).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
