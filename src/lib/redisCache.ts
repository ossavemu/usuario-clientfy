type CacheEntry = {
  value: string;
  timestamp: number;
};

class MemoryCache {
  private cache: Map<string, CacheEntry>;
  private readonly TTL: number; // Tiempo de vida en milisegundos

  constructor(ttlMinutes = 5) {
    this.cache = new Map();
    this.TTL = ttlMinutes * 60 * 1000;
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Verificar si la entrada ha expirado
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: string): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();
