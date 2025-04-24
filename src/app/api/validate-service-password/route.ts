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

    // Validar contraseña de servicio con Turso
    const isValid = await validateServicePassword(email, password);

    if (!isValid) {
      return NextResponse.json({
        success: true,
        isValid: false,
        message: 'La contraseña del servicio es incorrecta',
      });
    }

    // Contraseña válida
    return NextResponse.json({
      success: true,
      isValid: true,
      message: 'Contraseña de servicio válida',
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        isValid: false,
        message: 'Error al validar contraseña de servicio',
      },
      { status: 500 },
    );
  }
}
