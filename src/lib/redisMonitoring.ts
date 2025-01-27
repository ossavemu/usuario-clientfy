type OperationType = 'get' | 'cache_hit' | 'redis_hit' | 'redis_miss';

class RedisMonitor {
  private operations: Map<OperationType, number>;
  private keyAccess: Map<string, number>;

  constructor() {
    this.operations = new Map();
    this.keyAccess = new Map();
  }

  logOperation(type: OperationType, key: string): void {
    // Incrementar contador de tipo de operación
    const currentCount = this.operations.get(type) || 0;
    this.operations.set(type, currentCount + 1);

    // Incrementar contador de acceso a la clave
    const keyCount = this.keyAccess.get(key) || 0;
    this.keyAccess.set(key, keyCount + 1);
  }

  getStats(): {
    operations: Record<OperationType, number>;
    mostAccessedKeys: Array<{ key: string; count: number }>;
  } {
    const stats = {
      operations: Object.fromEntries(this.operations) as Record<
        OperationType,
        number
      >,
      mostAccessedKeys: Array.from(this.keyAccess.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([key, count]) => ({ key, count })),
    };

    return stats;
  }

  reset(): void {
    this.operations.clear();
    this.keyAccess.clear();
  }
}

export const redisMonitor = new RedisMonitor();
