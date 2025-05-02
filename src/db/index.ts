import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

export const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_TOKEN!,
});

export const db = drizzle(client);
