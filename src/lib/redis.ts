import { Redis } from "ioredis";
import { memoryCache } from "./redis-cache";
import { redisMonitor } from "./redis-monitoring";

let redis: Redis | null = null;

export function getRedisClient() {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        // Reintentar la conexión con un máximo de 3 intentos
        const delay = Math.min(times * 50, 2000);
        return times >= 3 ? null : delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redis.on("error", (error) => {
      console.error("Error de Redis:", error.message);
      // Solo registrar el error sin imprimir todo el objeto
    });

    redis.on("connect", () => {
      console.log("Conectado a Redis exitosamente");
    });
  }

  return redis;
}

// Función para cerrar la conexión (útil para tests y cleanup)
export async function closeRedisConnection() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export async function getFromRedis(
  redis: Redis,
  key: string
): Promise<string | null> {
  redisMonitor.logOperation("get", key);

  const cachedValue = memoryCache.get(key);
  if (cachedValue) {
    redisMonitor.logOperation("cache_hit", key);
    return cachedValue;
  }

  const value = await redis.get(key);
  if (value) {
    memoryCache.set(key, value);
    redisMonitor.logOperation("redis_hit", key);
  } else {
    redisMonitor.logOperation("redis_miss", key);
  }
  return value;
}
