import { type RegistrationData } from '@/types/registration';
import jwt from 'jsonwebtoken';
import { redis } from './redis';

export interface PhoneData {
  countryCode: string;
  phone: string;
  serviceType?: string;
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
    const key = `phone:${email}`;
    const phone = await redis.get(key);
    return phone ? JSON.parse(phone) : null;
  } catch (error) {
    console.error('Error al obtener teléfono:', error);
    return null;
  }
}

export async function saveUserPhone(email: string, phoneData: PhoneData) {
  try {
    const key = `phone:${email}`;
    await redis.set(key, JSON.stringify(phoneData));
    // Agregar un TTL de 24 horas para evitar datos huérfanos
    await redis.expire(key, 24 * 60 * 60);
    return true;
  } catch (error) {
    console.error('Error al guardar teléfono:', error);
    throw new Error('Error al guardar el teléfono en Redis');
  }
}

export async function deleteUserPhone(email: string) {
  try {
    await redis.del(`phone:${email}`);
    return true;
  } catch (error) {
    console.error('Error al eliminar teléfono:', error);
    throw new Error('Error al eliminar el teléfono de Redis');
  }
}

export async function updateUserPhone(email: string, phoneData: PhoneData) {
  try {
    const key = `phone:${email}`;
    await redis.set(key, JSON.stringify(phoneData));
    await redis.expire(key, 24 * 60 * 60);
    return true;
  } catch (error) {
    console.error('Error al actualizar teléfono:', error);
    throw new Error('Error al actualizar el teléfono en Redis');
  }
}
