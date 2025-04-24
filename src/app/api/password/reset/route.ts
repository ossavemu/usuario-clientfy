import { sendPasswordResetEmail } from '@/lib/email/password';
import { createPasswordResetToken } from '@/lib/turso/password';
import { validateServicePassword } from '@/lib/turso/servicePassword';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, servicePassword } = await request.json();

    if (!email || !servicePassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email y contraseña de servicio son requeridos',
        },
        { status: 400 },
      );
    }

    // Validar la contraseña de servicio
    const isValidPassword = await validateServicePassword(
      email,
      servicePassword,
    );

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Credenciales inválidas',
        },
        { status: 401 },
      );
    }

    // Crear token de restablecimiento
    const resetToken = await createPasswordResetToken(email);

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Error al generar token de restablecimiento',
        },
        { status: 500 },
      );
    }

    // Enviar email con el token
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Error al enviar email de restablecimiento:', emailError);
      return NextResponse.json(
        {
          success: false,
          message: 'Error al enviar email de restablecimiento',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Se ha enviado un enlace de restablecimiento a tu correo',
    });
  } catch (error) {
    console.error('Error en reset password:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud' },
      { status: 500 },
    );
  }
}
