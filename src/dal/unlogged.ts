import { db } from '@/db';
import { password_resets, users } from '@/db/schema';
import { randomUUID } from 'crypto';
import { and, eq, sql } from 'drizzle-orm';
import type { User } from './schemas';
import { UserSchema } from './schemas';

import { service_passwords } from '@/db/schema';

function cleanUserForInsert(user: Partial<User> & { email: string }) {
  return {
    email: user.email,
    name: user.name ?? '',
    company_name: user.company_name ?? '',
    password: user.password ?? '',
    phone: user.phone ?? '',
    country_code: user.country_code ?? '',
    service_type: user.service_type ?? 'whatsapp',
    images: user.images ?? [],
    training_files: user.training_files ?? [],
    prompt: user.prompt ?? '',
    assistant_name: user.assistant_name ?? '',
    address: user.address ?? '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function getAllUsers() {
  return db.select().from(users);
}

export async function getUser(email: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.email, email));
  if (result.length === 0) return null;
  return UserSchema.parse(result[0]);
}

export async function saveUser(
  user: Partial<User> & { email: string },
): Promise<boolean> {
  const existing = await getUser(user.email);
  if (existing) {
    await db
      .update(users)
      .set({
        ...user,
        updated_at: new Date().toISOString(),
      })
      .where(eq(users.email, user.email));
  } else {
    await db.insert(users).values(cleanUserForInsert(user));
  }
  return true;
}

export async function getUserPhone(
  email: string,
): Promise<{ phone: string; countryCode: string; serviceType: string } | null> {
  const result = await db
    .select({
      phone: users.phone,
      countryCode: users.country_code,
      serviceType: users.service_type,
    })
    .from(users)
    .where(eq(users.email, email));
  if (result.length === 0) return null;
  const { phone, countryCode, serviceType } = result[0];
  return {
    phone: phone ?? '',
    countryCode: countryCode ?? '',
    serviceType: serviceType ?? '',
  };
}

export async function saveUserPhone(
  email: string,
  phone: string,
  countryCode: string,
  serviceType: string,
): Promise<boolean> {
  await db
    .update(users)
    .set({
      phone,
      country_code: countryCode,
      service_type: serviceType,
      updated_at: new Date().toISOString(),
    })
    .where(eq(users.email, email));
  return true;
}

export async function deleteUserPhone(email: string): Promise<boolean> {
  await db
    .update(users)
    .set({
      phone: '',
      country_code: '',
      service_type: '',
      updated_at: new Date().toISOString(),
    })
    .where(eq(users.email, email));
  return true;
}

export async function getUserAddress(email: string): Promise<string | null> {
  const result = await db
    .select({ address: users.address })
    .from(users)
    .where(eq(users.email, email));
  if (result.length === 0) return null;
  return result[0].address ?? '';
}

export async function saveUserAddress(
  email: string,
  address: string,
): Promise<boolean> {
  await db
    .update(users)
    .set({ address, updated_at: new Date().toISOString() })
    .where(eq(users.email, email));
  return true;
}

export async function deleteUserAddress(email: string): Promise<boolean> {
  await db
    .update(users)
    .set({ address: '', updated_at: new Date().toISOString() })
    .where(eq(users.email, email));
  return true;
}

export async function getAllPasswordResets() {
  return db.select().from(password_resets);
}

export async function createPasswordResetToken(
  email: string,
  expiresInHours = 24,
): Promise<string | null> {
  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);
  await db.delete(password_resets).where(eq(password_resets.email, email));
  await db.insert(password_resets).values({
    token,
    email,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  });
  return token;
}

export async function verifyPasswordResetToken(
  token: string,
): Promise<string | null> {
  const now = new Date().toISOString();
  const result = await db
    .select({
      email: password_resets.email,
      expires_at: password_resets.expires_at,
    })
    .from(password_resets)
    .where(
      and(
        eq(password_resets.token, token),
        sql`${password_resets.expires_at} > ${now}`,
      ),
    );
  if (result.length === 0) return null;
  return result[0].email;
}

export async function deletePasswordResetToken(
  token: string,
): Promise<boolean> {
  await db.delete(password_resets).where(eq(password_resets.token, token));
  return true;
}

export async function cleanExpiredPasswordResetTokens(): Promise<number> {
  const now = new Date().toISOString();
  const result = await db
    .delete(password_resets)
    .where(sql`${password_resets.expires_at} < ${now}`);
  return result.rowsAffected ?? 0;
}

export async function getUserByPhone(phone: string): Promise<string | null> {
  const result = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.phone, phone));
  if (result.length === 0) return null;
  return result[0].email;
}

export async function saveTrainingFiles(
  email: string,
  files: { id: string; name: string; url: string }[],
): Promise<boolean> {
  await db
    .update(users)
    .set({ training_files: files, updated_at: new Date().toISOString() })
    .where(eq(users.email, email));
  return true;
}

export async function getServicePassword(
  email: string,
): Promise<string | null> {
  const result = await db
    .select({ password: service_passwords.password })
    .from(service_passwords)
    .where(eq(service_passwords.email, email));
  if (result.length === 0) return null;
  return result[0].password;
}

export async function validateServicePassword(
  email: string,
  password: string,
): Promise<boolean> {
  const storedPassword = await getServicePassword(email);
  if (!storedPassword) return false;
  return storedPassword === password;
}
