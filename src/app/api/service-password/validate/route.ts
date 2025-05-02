import { validateServicePassword } from '@/dal/unlogged';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password)
      return jsonError('Email y contraseña requeridos', 400);

    const isValid = await validateServicePassword(email, password);
    return jsonSuccess({ isValid });
  } catch (error) {
    console.error('Error al validar contraseña:', error);
    return jsonError('Error al validar contraseña', 500);
  }
}
