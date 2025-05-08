import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { setAdminCookie, signAdmin } from '@/lib/session/admin';

export async function POST(request: Request) {
  const { password } = await request.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return jsonError('Contraseña incorrecta', 401);
  }
  const token = signAdmin();
  await setAdminCookie(token);
  return jsonSuccess({ success: true });
}
