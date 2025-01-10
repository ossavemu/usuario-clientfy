import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const redis = new Redis(process.env.REDIS_URL || '');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { email } = await request.json();

    try {
      // Verificar que el token sea válido
      jwt.verify(token, JWT_SECRET);

      // Eliminar la sesión de Redis
      await redis.del(`session:${email}`);

      return NextResponse.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido', details: error },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
