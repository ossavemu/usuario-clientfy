import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { validateServicePassword } from '@/lib/turso/servicePassword';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password)
      throw new Error('Email y contraseña son requeridos');
    const isValid = await validateServicePassword(email, password);
    return jsonSuccess({
      success: true,
      isValid,
      message: isValid
        ? 'Contraseña de servicio válida'
        : 'Contraseña de servicio inválida',
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Error al validar contraseña',
      500,
    );
  }
}
