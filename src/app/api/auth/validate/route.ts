import { validateSession } from '@/dal/logged';
import { getUser } from '@/dal/unlogged';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.SECRET_KEY || 'your-secret-key';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 },
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      // Validar JWT
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string };

      // Verificar sesión en Turso
      const { valid, email } = await validateSession(token);

      if (!valid || email !== decoded.email) {
        return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
      }

      // Verificar si el usuario existe
      const user = await getUser(decoded.email);

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 },
        );
      }

      return NextResponse.json({ valid: true });
    } catch (jwtError) {
      console.error('Error de JWT:', jwtError);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error validando token:', error);
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}
