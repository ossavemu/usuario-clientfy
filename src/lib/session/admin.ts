import { ADMIN_JWT_SECRET, COOKIE_NAME_ADMIN } from '@/lib/constants/session';
import { deleteCookie, getCookie, setCookie } from '@/lib/cookies';
import jwt from 'jsonwebtoken';

export function signAdmin(): string {
  return jwt.sign({ role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '8h' });
}

export function verifyAdmin(token: string) {
  return jwt.verify(token, ADMIN_JWT_SECRET) as {
    role: string;
    iat: number;
    exp: number;
  };
}

export async function setAdminCookie(token: string) {
  await setCookie(COOKIE_NAME_ADMIN, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export async function requireAdmin() {
  const cookie = await getCookie(COOKIE_NAME_ADMIN);
  const payload = verifyAdmin(cookie!);
  if (payload.role !== 'admin') throw new Error('No autorizado');
  return payload;
}

export async function clearAdminCookie() {
  await deleteCookie(COOKIE_NAME_ADMIN);
}

export async function isAdmin(): Promise<void> {
  try {
    await requireAdmin();
  } catch {
    throw new Error('No autorizado');
  }
}
