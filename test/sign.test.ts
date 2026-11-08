import { describe, expect, it } from 'vitest';
import { isFresh, sign, verify } from '../src/webhooks/sign.js';

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

describe('isFresh', () => {
  const tolerance = 300_000;

  it('accepts a timestamp inside the window', () => {
    expect(isFresh(1_000_000, 1_100_000, tolerance)).toBe(true);
  });

  it('accepts a timestamp exactly at the tolerance', () => {
    expect(isFresh(0, tolerance, tolerance)).toBe(true);
  });

  it('rejects a stale timestamp', () => {
    expect(isFresh(0, tolerance + 1, tolerance)).toBe(false);
  });

  it('rejects a timestamp too far in the future', () => {
    expect(isFresh(tolerance + 1, 0, tolerance)).toBe(false);
  });
});
