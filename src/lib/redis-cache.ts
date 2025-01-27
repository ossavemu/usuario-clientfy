type CacheValue = string | null;
type CacheEntry = {
  value: CacheValue;
  expiry: number;
};

class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map();

  set(key: string, value: CacheValue, ttlSeconds: number = 300) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  get(key: string): CacheValue {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
}

export const memoryCache = new MemoryCache();
