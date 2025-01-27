import { Redis } from 'ioredis';
import { memoryCache } from './redisCache';
import { redisMonitor } from './redisMonitoring';

// Singleton instance
const redis = new Redis(process.env.REDIS_URL || '', {
  retryStrategy: (times) => {
    // Reintentar la conexión con un máximo de 3 intentos
    const delay = Math.min(times * 50, 2000);
    return times >= 3 ? null : delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    return err.message.includes(targetError);
  },
  connectTimeout: 10000, // 10 segundos de timeout para la conexión
});

redis.on('error', (error) => {
  console.error('Error de Redis:', error.message);
  // Solo registrar el error sin imprimir todo el objeto
});

redis.on('connect', () => {
  console.log('Conectado a Redis exitosamente');
});

redis.on('ready', () => {
  console.log('Cliente Redis listo para recibir comandos');
});

redis.on('reconnecting', () => {
  console.log('Intentando reconectar a Redis...');
});

// Exportar la instancia única
export { redis };

// Funciones auxiliares
export async function getFromRedis(key: string): Promise<string | null> {
  redisMonitor.logOperation('get', key);

  const cachedValue = memoryCache.get(key);
  if (cachedValue) {
    redisMonitor.logOperation('cache_hit', key);
    return cachedValue;
  }

  const value = await redis.get(key);
  if (value) {
    memoryCache.set(key, value);
    redisMonitor.logOperation('redis_hit', key);
  } else {
    redisMonitor.logOperation('redis_miss', key);
  }
  return value;
}
