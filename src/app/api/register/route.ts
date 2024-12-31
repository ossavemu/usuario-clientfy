'use server';

import { RegistrationData } from '@/types/registration';
import bcrypt from 'bcryptjs';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const redis = new Redis(process.env.REDIS_URL || '');
const SERVICE_PASSWORD = 'ItLY51H2fh';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const data: RegistrationData & {
      password: { service: string; user: string };
    } = await request.json();

    // Validar datos requeridos
    if (
      !data.name ||
      !data.email ||
      !data.password?.service ||
      !data.password?.user
    ) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar contraseña del servicio
    if (data.password.service !== SERVICE_PASSWORD) {
      return NextResponse.json(
        { error: 'La contraseña del servicio no es válida' },
        { status: 400 }
      );
    }

    // Validar contraseña personal
    if (
      data.password.user.length < 8 ||
      !/[a-zA-Z]/.test(data.password.user) ||
      !/\d/.test(data.password.user)
    ) {
      return NextResponse.json(
        { error: 'La contraseña personal no cumple con los requisitos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await redis.hget('users', data.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Encriptar contraseña personal
    const hashedPassword = await bcrypt.hash(data.password.user, 10);

    // Crear usuario con la estructura completa
    const user = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone || '',
      countryCode: data.countryCode || '',
      serviceType: data.serviceType || 'whatsapp',
      images: data.images || [],
      trainingFiles: data.trainingFiles || [],
      prompt: data.prompt || '',
      assistantName: data.assistantName || '',
      createdAt: new Date().toISOString(),
    };

    // Guardar usuario en Redis
    await redis.hset('users', data.email, JSON.stringify(user));

    // Generar token JWT
    const token = jwt.sign({ email: data.email }, JWT_SECRET, {
      expiresIn: '24h',
    });

    // Guardar sesión en Redis
    await redis.set(`session:${data.email}`, token, 'EX', 86400); // 24 horas

    return NextResponse.json({ token, user: { ...user, password: undefined } });
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
