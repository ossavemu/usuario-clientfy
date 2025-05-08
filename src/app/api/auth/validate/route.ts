import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { requireUser } from '@/lib/session/user';

export async function GET() {
  try {
    const { email } = await requireUser();
    return jsonSuccess({ valid: true, email });
  } catch (error) {
    console.error('Error validando token:', error);
    return jsonError('Sesión inválida', 401);
  }
}
