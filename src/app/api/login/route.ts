'use server';

import { saveSession } from '@/dal/logged';
import { getUser } from '@/dal/unlogged';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { ENCRYPT_ALGORITHM } from '@/lib/constants/encrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SECRET_KEY || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return jsonError('Email y contraseña son requeridos', 400);
    }

    // Verificar si el usuario existe
    let user;
    try {
      user = await getUser(email);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes('no tiene teléfono o código de país')
      ) {
        return jsonError(error.message, 400);
      }
      return jsonError('Error al obtener usuario', 500);
    }
    if (!user) {
      return jsonError('Usuario no encontrado', 404);
    }

    // Verificar contraseña
    const isValidPassword = await Bun.password.verify(
      password,
      user.password,
      ENCRYPT_ALGORITHM,
    );
    if (!isValidPassword) {
      return jsonError('Contraseña incorrecta', 401);
    }

    // Generar token JWT
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });

    try {
      // Guardar sesión en Turso con expiración
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas
      await saveSession(email, token, expiresAt);
    } catch (error) {
      console.error('Error guardando sesión:', error);
      return jsonError('Error al iniciar sesión (error de servidor)', 500);
    }

    // Devolver usuario sin la contraseña
    const userWithoutPassword = { ...user, password: undefined };

    return jsonSuccess({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return jsonError('Error al iniciar sesión', 500);
  }
}
