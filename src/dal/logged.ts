import { db } from '@/db';
import { instances, sessions } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { SessionSchema } from './schemas';

export async function getAllSessions() {
  return db.select().from(sessions);
}

export async function getAllInstances() {
  return db.select().from(instances);
}

export async function saveSession(
  email: string,
  token: string,
  expiresAt: Date,
): Promise<boolean> {
  const exists = await db
    .select()
    .from(sessions)
    .where(eq(sessions.email, email));
  const expiresAtISO = expiresAt.toISOString();
  if (exists.length > 0) {
    await db
      .update(sessions)
      .set({
        token,
        expires_at: expiresAtISO,
        updated_at: new Date().toISOString(),
      })
      .where(eq(sessions.email, email));
  } else {
    await db.insert(sessions).values({
      email,
      token,
      expires_at: expiresAtISO,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return true;
}

export async function validateSession(
  token: string,
): Promise<{ valid: boolean; email: string | null }> {
  const now = new Date().toISOString();
  const result = await db
    .select()
    .from(sessions)
    .where(
      and(eq(sessions.token, token), sql`${sessions.expires_at} > ${now}`),
    );
  if (result.length === 0) return { valid: false, email: null };
  const sessionData = SessionSchema.parse(result[0]);
  return { valid: true, email: sessionData.email };
}

export async function deleteSession(email: string): Promise<boolean> {
  await db.delete(sessions).where(eq(sessions.email, email));
  return true;
}

export async function cleanExpiredSessions(): Promise<number> {
  const now = new Date().toISOString();
  const result = await db
    .delete(sessions)
    .where(sql`${sessions.expires_at} < ${now}`);
  return result.rowsAffected ?? 0;
}

export async function saveInstanceIp(
  email: string,
  ipAddress: string,
): Promise<boolean> {
  const exists = await db
    .select()
    .from(instances)
    .where(eq(instances.email, email));
  if (exists.length > 0) {
    await db
      .update(instances)
      .set({ ip_address: ipAddress, updated_at: new Date().toISOString() })
      .where(eq(instances.email, email));
  } else {
    await db.insert(instances).values({
      email,
      ip_address: ipAddress,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return true;
}

export async function getInstanceIp(email: string): Promise<string | null> {
  const result = await db
    .select({ ip_address: instances.ip_address })
    .from(instances)
    .where(eq(instances.email, email));
  if (result.length === 0) return null;
  return result[0].ip_address;
}

export async function deleteInstance(email: string): Promise<boolean> {
  await db.delete(instances).where(eq(instances.email, email));
  return true;
}

export async function hasActiveInstance(email: string): Promise<boolean> {
  const ip = await getInstanceIp(email);
  return ip !== null;
}

export async function getInstanceByPhone(phone: string): Promise<{
  status: string;
  instanceInfo?: { ip: string; hostname: string; email: string };
} | null> {
  const user = await db
    .select({ email: instances.email })
    .from(instances)
    .where(eq(instances.email, phone));
  if (user.length === 0) return null;
  const email = user[0].email;
  const instance = await db
    .select()
    .from(instances)
    .where(eq(instances.email, email));
  if (instance.length === 0) return null;
  return {
    status: 'completed',
    instanceInfo: {
      ip: instance[0].ip_address,
      hostname: `bot-${phone}`,
      email,
    },
  };
}
