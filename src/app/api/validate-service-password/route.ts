import { validateServicePassword } from '@/dal/unlogged';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password)
      throw new Error('Email y contraseña son requeridos');
    const isValid = await validateServicePassword(email, password);
    if (!isValid) {
      return jsonSuccess({
        success: true,
        isValid: false,
        message: 'La contraseña del servicio es incorrecta',
      });
    }
    return jsonSuccess({
      success: true,
      isValid: true,
      message: 'Contraseña de servicio válida',
    });
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : 'Error al validar contraseña de servicio',
      500,
    );
  }
}
