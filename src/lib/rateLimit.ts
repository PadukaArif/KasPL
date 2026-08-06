/**
 * Rate Limiting Architecture Layer
 * Provides an in-memory sliding window token bucket rate limiter interface.
 * Can be extended to use Redis or external key-value stores for distributed environments.
 */

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number;      // Max requests allowed per window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

class MemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();

  check(key: string, options: RateLimitOptions): RateLimitResult {
    const now = Date.now();
    const windowStart = now - options.windowMs;

    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter((time) => time > windowStart);

    if (validTimestamps.length >= options.max) {
      return {
        success: false,
        limit: options.max,
        remaining: 0,
        reset: validTimestamps[0] + options.windowMs,
      };
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return {
      success: true,
      limit: options.max,
      remaining: options.max - validTimestamps.length,
      reset: now + options.windowMs,
    };
  }

  // Periodic cleanup of expired keys
  cleanup(windowMs: number) {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const valid = timestamps.filter((t) => t > now - windowMs);
      if (valid.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, valid);
      }
    }
  }
}

export const rateLimiter = new MemoryRateLimiter();
