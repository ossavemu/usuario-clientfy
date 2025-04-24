import { sendServicePasswordEmail } from '@/lib/email/password';
import { createServicePassword } from '@/lib/turso/servicePassword';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email requerido' },
        { status: 400 },
      );
    }

    // Generar contraseña de servicio
    const password = await createServicePassword(email);

    // Enviar correo electrónico con la contraseña
    try {
      await sendServicePasswordEmail(email, password);
    } catch (error) {
      console.error('Error al enviar email:', error);
      // No fallamos si el correo no se envía, solo lo registramos
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña generada y enviada exitosamente',
      email,
      password,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error al generar contraseña' },
      { status: 500 },
    );
  }
}
