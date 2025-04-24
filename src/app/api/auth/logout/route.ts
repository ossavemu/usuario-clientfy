import { deleteSession } from '@/lib/turso/session';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.SECRET_KEY || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 },
      );
    }

    const token = authHeader.split(' ')[1];
    const { email } = await request.json();

    try {
      // Verificar que el token sea válido
      jwt.verify(token, JWT_SECRET);

      // Eliminar la sesión de Turso
      await deleteSession(email);

      return NextResponse.json({ message: 'Sesión cerrada exitosamente' });
    } catch (jwtError) {
      console.error('Error al verificar token JWT:', jwtError);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 },
    );
  }
}
