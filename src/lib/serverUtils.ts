import { type RegistrationData } from '@/types/registration';
import jwt from 'jsonwebtoken';
import { redis } from './redis';

export interface PhoneData {
  countryCode: string;
  phone: string;
  serviceType: string;
}

export async function saveUser(data: RegistrationData) {
  try {
    const token = jwt.sign({ email: data.email }, 'tu_secreto_jwt', {
      expiresIn: '1h',
    });
    await redis.set(`user:${data.email}`, JSON.stringify(data));
    await redis.expire(`user:${data.email}`, 24 * 60 * 60);
    return token;
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    throw new Error('Error al guardar el usuario en Redis');
  }
}

export async function getUser(email: string) {
  try {
    const user = await redis.get(`user:${email}`);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
}

export async function getUserPhone(email: string) {
  try {
    const userData = await redis.hgetall(`user:${email}`);
    if (!userData.phone) return null;

    return {
      phone: userData.phone,
      countryCode: userData.countryCode,
      serviceType: userData.serviceType,
    };
  } catch (error) {
    console.error('Error al obtener teléfono de Redis:', error);
    throw error;
  }
}

export async function saveUserPhone(email: string, phoneData: PhoneData) {
  try {
    await redis.hset(`user:${email}`, {
      phone: phoneData.phone,
      countryCode: phoneData.countryCode,
      serviceType: phoneData.serviceType,
    });
    return true;
  } catch (error) {
    console.error('Error al guardar teléfono en Redis:', error);
    throw error;
  }
}

export async function deleteUserPhone(email: string) {
  try {
    await redis.hdel(`user:${email}`, 'phone', 'countryCode', 'serviceType');
    return true;
  } catch (error) {
    console.error('Error al eliminar teléfono de Redis:', error);
    throw error;
  }
}

export async function updateUserPhone(email: string, phoneData: PhoneData) {
  return await saveUserPhone(email, phoneData);
}
