'use server';
import { db } from '@/db';
import { franchises, service_passwords } from '@/db/schema';

import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

import { isAdmin } from '@/lib/session/admin';

export async function getAllFranchises() {
  isAdmin();
  return db.select().from(franchises);
}

export async function findFranchiseById(state_id: string) {
  isAdmin();
  return db.select().from(franchises).where(eq(franchises.state_id, state_id));
}

export async function findFranchiseByEmail(email: string) {
  isAdmin();
  return db.select().from(franchises).where(eq(franchises.email, email));
}

export async function createFranchise({
  name,
  personOrCompanyName,
  stateId,
  email,
  contractedInstances,
}: {
  name: string;
  personOrCompanyName: string;
  stateId: string;
  email: string;
  contractedInstances: number;
}) {
  isAdmin();
  return db.insert(franchises).values({
    name,
    person_or_company_name: personOrCompanyName,
    state_id: stateId,
    email,
    contracted_instances: contractedInstances,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function deleteFranchiseByEmail(email: string) {
  isAdmin();
  return db.delete(franchises).where(eq(franchises.email, email));
}

export async function getAllServicePasswords() {
  isAdmin();
  return db.select().from(service_passwords);
}

export async function findServicePasswordByEmail(email: string) {
  isAdmin();
  return db
    .select()
    .from(service_passwords)
    .where(eq(service_passwords.email, email));
}

export async function deleteServicePasswordByEmail(email: string) {
  isAdmin();
  return db.delete(service_passwords).where(eq(service_passwords.email, email));
}

function generateRandomPassword(length = 8): string {
  return randomUUID().replace(/-/g, '').slice(0, length);
}

export async function createServicePassword(email: string): Promise<string> {
  isAdmin();
  const password = generateRandomPassword();
  const exists = await db
    .select()
    .from(service_passwords)
    .where(eq(service_passwords.email, email));
  if (exists.length > 0) {
    await db
      .update(service_passwords)
      .set({ password, updated_at: new Date().toISOString() })
      .where(eq(service_passwords.email, email));
  } else {
    await db.insert(service_passwords).values({
      email,
      password,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return password;
}
