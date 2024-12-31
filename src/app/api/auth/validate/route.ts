import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const redis = new Redis(process.env.REDIS_URL || '');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };

    // Verificar si existe la sesión en Redis
    const sessionToken = await redis.get(`session:${decoded.email}`);
    if (!sessionToken || sessionToken !== token) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    // Verificar si el usuario existe
    const user = await redis.hget('users', decoded.email);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Error validando token:', error);
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}
