const MAX_PER_SECOND = 10;
const BURST = 5;

export interface RateLimiter {
  take(endpointId: string, now: number): boolean;
}

export function createRateLimiter(): RateLimiter {
  const windows = new Map<string, { start: number; count: number }>();
  return {
    take(endpointId, now) {
      const window = windows.get(endpointId);
      if (!window || now - window.start >= 1000) {
        windows.set(endpointId, { start: now, count: 1 });
        return true;
      }
      if (window.count >= MAX_PER_SECOND + BURST) {
        console.log(`rate limited ${endpointId}`);
        return false;
      }
      window.count++;
      return true;
    },
  };
}
