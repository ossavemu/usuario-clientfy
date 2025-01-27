import { Redis } from "ioredis";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    if (!process.env.REDIS_URL) {
      throw new Error("REDIS_URL no está definida en las variables de entorno");
    }

    redisClient = new Redis(process.env.REDIS_URL as string, {
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
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
      connectTimeout: 10000,
      commandTimeout: 5000,
      keepAlive: 10000,
      autoResubscribe: true,
      autoResendUnfulfilledCommands: true,
    });

    redisClient.on("error", (error) => {
      console.error("Redis error:", error.message);
    });

    redisClient.on("connect", () => {
      console.log("Conectado a Redis exitosamente");
    });

    redisClient.on("ready", () => {
      console.log("Cliente Redis listo para recibir comandos");
    });

    redisClient.on("reconnecting", () => {
      console.log("Intentando reconectar a Redis...");
    });
  }
  return redisClient;
}

export async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
