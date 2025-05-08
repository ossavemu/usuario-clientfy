import { createServicePassword } from '@/dal/admin';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return jsonError('Email requerido', 400);
    }
    const password = await createServicePassword(email);
    return jsonSuccess({
      message: 'Contraseña generada exitosamente',
      password,
    });
  } catch {
    return jsonError('Error al generar contraseña', 500);
  }
}
