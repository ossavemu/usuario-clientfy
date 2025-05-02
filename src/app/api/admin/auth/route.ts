import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';

export async function POST(request: Request) {
  const { password } = await request.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return jsonError('Contraseña incorrecta', 401);
  }
  const token = process.env.ADMIN_SESSION_TOKEN!;
  const response = jsonSuccess({ success: true });
  response.cookies.set('adminAuth', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return response;
}
