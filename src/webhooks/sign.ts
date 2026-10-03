import { createHmac, timingSafeEqual } from 'node:crypto';

export function sign(secret: string, body: string, timestamp: number): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
}

export function verify(
  secret: string,
  body: string,
  timestamp: number,
  signature: string,
): boolean {
  const expected = Buffer.from(sign(secret, body, timestamp));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function isFresh(timestamp: number, now: number, toleranceMs: number): boolean {
  return Math.abs(now - timestamp) < toleranceMs;
}
