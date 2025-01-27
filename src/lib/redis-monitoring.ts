type RedisOperation = {
  timestamp: number;
  operation: string;
  key: string;
};

class RedisMonitor {
  private operations: RedisOperation[] = [];
  private readonly maxLogs = 1000;

  logOperation(operation: string, key: string) {
    this.operations.push({
      timestamp: Date.now(),
      operation,
      key,
    });

    if (this.operations.length > this.maxLogs) {
      this.operations.shift();
    }

    // Detectar posibles problemas
    this.detectPotentialIssues(key);
  }

  private detectPotentialIssues(key: string) {
    const last5Seconds = Date.now() - 5000;
    const recentOperations = this.operations.filter(
      (op) => op.timestamp > last5Seconds && op.key === key
    );

    if (recentOperations.length > 10) {
      console.warn(
        `⚠️ Alta frecuencia de operaciones detectada para la clave: ${key}`
      );
      console.warn(
        `${recentOperations.length} operaciones en los últimos 5 segundos`
      );
    }
  }

  getStats() {
    return {
      totalOperations: this.operations.length,
      operationsLast5Mins: this.operations.filter(
        (op) => op.timestamp > Date.now() - 300000
      ).length,
    };
  }
}

export const redisMonitor = new RedisMonitor();
