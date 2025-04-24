'use server';

import { ENCRYPT_ALGORITHM } from '@/lib/constants/encrypt';
import { getUser } from '@/lib/turso/operations';
import { saveSession } from '@/lib/turso/session';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.SECRET_KEY || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 },
      );
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
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json(
        { error: 'Error al obtener usuario' },
        { status: 500 },
      );
    }
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 },
      );
    }

    // Verificar contraseña
    const isValidPassword = await Bun.password.verify(
      password,
      user.password,
      ENCRYPT_ALGORITHM,
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 },
      );
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
      return NextResponse.json(
        { error: 'Error al iniciar sesión (error de servidor)' },
        { status: 500 },
      );
    }

    // Devolver usuario sin la contraseña
    const userWithoutPassword = { ...user, password: undefined };

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 },
    );
  }
}
