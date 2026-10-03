import { describe, expect, it } from 'vitest';
import { sign, verify } from '../src/webhooks/sign.js';

describe('sign', () => {
  it('produces a stable hex signature', () => {
    expect(sign('s3cret', '{"a":1}', 1700000000000)).toBe(
      sign('s3cret', '{"a":1}', 1700000000000),
    );
  });

  it('verifies a matching signature', () => {
    const sig = sign('s3cret', 'body', 42);
    expect(verify('s3cret', 'body', 42, sig)).toBe(true);
  });

  it('rejects a tampered body, timestamp or secret', () => {
    const sig = sign('s3cret', 'body', 42);
    expect(verify('s3cret', 'bodyx', 42, sig)).toBe(false);
    expect(verify('s3cret', 'body', 43, sig)).toBe(false);
    expect(verify('other', 'body', 42, sig)).toBe(false);
  });

  it('rejects a signature of the wrong length', () => {
    expect(verify('s3cret', 'body', 42, 'abc')).toBe(false);
  });
});
