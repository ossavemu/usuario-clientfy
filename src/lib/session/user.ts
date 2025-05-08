import { validateSession } from '@/dal/logged';
import { COOKIE_NAME_USER, USER_JWT_SECRET } from '@/lib/constants/session';
import { deleteCookie, getCookie, setCookie } from '@/lib/cookies';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import type { NextResponse } from 'next/server';

export interface UserJwtPayload extends JwtPayload {
  email: string;
}

export function signUser(email: string): string {
  return jwt.sign({ email }, USER_JWT_SECRET, { expiresIn: '24h' });
}

export async function setUserCookie(
  res: NextResponse,
  token: string,
): Promise<void> {
  await setCookie(COOKIE_NAME_USER, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60,
  });
}

export async function clearUserCookie(): Promise<void> {
  await deleteCookie(COOKIE_NAME_USER);
}

export async function requireUser(): Promise<{ email: string }> {
  const cookie = await getCookie(COOKIE_NAME_USER);
  const payload = jwt.verify(cookie!, USER_JWT_SECRET) as UserJwtPayload;
  const { valid, email } = await validateSession(cookie!);
  if (!valid || email !== payload.email) throw new Error('No autorizado');
  return { email };
}

export async function isUser(): Promise<void> {
  try {
    await requireUser();
  } catch {
    throw new Error('No autorizado');
  }
}
