// In-memory TTL cache for OSINT results.
// Phase 2: replace with Redis (Upstash) — same interface, zero refactor.

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class IntelCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtlMs: number;

  constructor(defaultTtlMinutes = 60) {
    this.defaultTtlMs = defaultTtlMinutes * 60 * 1000;
    // Clean expired entries every 10 minutes
    setInterval(() => this.evict(), 10 * 60 * 1000);
  }

  set<T>(key: string, value: T, ttlMinutes?: number): void {
    const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTtlMs;
    this.store.set(key, { data: value, expiresAt: Date.now() + ttl });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  private evict(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }

  size(): number {
    return this.store.size;
  }
}

// Singleton — survives across hot-reloads in dev via globalThis
const globalForCache = globalThis as typeof globalThis & { _intelCache?: IntelCache };
export const intelCache = globalForCache._intelCache ?? new IntelCache(60);
if (process.env.NODE_ENV !== 'production') globalForCache._intelCache = intelCache;
