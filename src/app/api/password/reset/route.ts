import {
  createPasswordResetToken,
  validateServicePassword,
} from '@/dal/unlogged';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { sendPasswordResetEmail } from '@/lib/email/password';
export async function POST(request: Request) {
  try {
    const { email, servicePassword } = await request.json();

    if (!email || !servicePassword) {
      return jsonError('Email y contraseña de servicio son requeridos', 400);
    }

    // Validar la contraseña de servicio
    const isValidPassword = await validateServicePassword(
      email,
      servicePassword,
    );

    if (!isValidPassword) {
      return jsonError('Credenciales inválidas', 401);
    }

    // Crear token de restablecimiento
    const resetToken = await createPasswordResetToken(email);

    if (!resetToken) {
      return jsonError('Error al generar token de restablecimiento', 500);
    }

    // Enviar email con el token
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Error al enviar email de restablecimiento:', emailError);
      return jsonError('Error al enviar email de restablecimiento', 500);
    }

    return jsonSuccess({
      success: true,
      message: 'Se ha enviado un enlace de restablecimiento a tu correo',
    });
  } catch (error) {
    console.error('Error en reset password:', error);
    return jsonError('Error al procesar la solicitud', 500);
  }
}
