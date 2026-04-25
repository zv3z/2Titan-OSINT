// Per-IP sliding-window rate limiter.
// Phase 2: replace with Upstash Redis rate limiter — same interface.

interface Window {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store = new Map<string, Window>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 20, windowSeconds = 60) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;
    setInterval(() => this.evict(), 5 * 60 * 1000);
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    let window = this.store.get(identifier);

    if (!window || now > window.resetAt) {
      window = { count: 0, resetAt: now + this.windowMs };
      this.store.set(identifier, window);
    }

    const remaining = Math.max(0, this.maxRequests - window.count - 1);

    if (window.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: window.resetAt };
    }

    window.count++;
    return { allowed: true, remaining, resetAt: window.resetAt };
  }

  private evict(): void {
    const now = Date.now();
    for (const [key, window] of this.store) {
      if (now > window.resetAt) this.store.delete(key);
    }
  }
}

const globalForRL = globalThis as typeof globalThis & { _rateLimiter?: RateLimiter };
export const rateLimiter = globalForRL._rateLimiter ?? new RateLimiter(30, 60);
if (process.env.NODE_ENV !== 'production') globalForRL._rateLimiter = rateLimiter;
