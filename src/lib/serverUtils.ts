import { RegistrationData } from '@/types/registration';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';

const redis = new Redis(process.env.REDIS_URL || '', {
  tls: {
    rejectUnauthorized: false,
  },
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 5,
});

// Manejar eventos de Redis
redis.on('error', (error) => {
  console.error('Error de conexión Redis:', error);
});

redis.on('connect', () => {
  console.log('Conectado exitosamente a Redis');
});

export async function saveUser(data: RegistrationData) {
  const token = jwt.sign({ email: data.email }, 'tu_secreto_jwt', {
    expiresIn: '1h',
  });
  await redis.set(`user:${data.email}`, JSON.stringify(data));
  return token;
}

export async function getUser(email: string) {
  const user = await redis.get(`user:${email}`);
  return user ? JSON.parse(user) : null;
}

export async function getUserPhone(email: string) {
  const phone = await redis.get(`phone:${email}`);
  return phone ? JSON.parse(phone) : null;
}

export async function saveUserPhone(email: string, phoneData: any) {
  await redis.set(`phone:${email}`, JSON.stringify(phoneData));
  return true;
}

export async function deleteUserPhone(email: string) {
  await redis.del(`phone:${email}`);
  return true;
}

export async function updateUserPhone(email: string, phoneData: any) {
  await redis.set(`phone:${email}`, JSON.stringify(phoneData));
  return true;
}
