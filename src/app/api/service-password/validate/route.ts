import { validateServicePassword } from '@/lib/turso/servicePassword';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email y contraseña son requeridos' },
        { status: 400 },
      );
    }

    const isValid = await validateServicePassword(email, password);

    return NextResponse.json({
      success: true,
      isValid,
      message: isValid
        ? 'Contraseña de servicio válida'
        : 'Contraseña de servicio inválida',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error al validar contraseña' },
      { status: 500 },
    );
  }
}
