'use server';

import { redis } from '@/lib/redis';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validar datos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const userStr = await redis.hget('users', email);
    if (!userStr) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const user = JSON.parse(userStr);

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });

    // Guardar sesión en Redis
    await redis.set(`session:${email}`, token, 'EX', 86400); // 24 horas

    // Devolver usuario sin la contraseña
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
