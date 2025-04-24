import { TURSO_CONFIG } from '@/lib/config';
import type { ResultSet } from '@libsql/client';
import { createClient, type Value } from '@libsql/client';

export const db = createClient({
  url: TURSO_CONFIG.DATABASE_URL,
  authToken: TURSO_CONFIG.TOKEN,
});

export async function executeQuery<T = ResultSet>(
  query: string,
  params: Value[] = [],
): Promise<T> {
  try {
    const result = await db.execute(query, params);

    return result as unknown as T;
  } catch (error) {
    console.error('Error ejecutando query:', error);
    throw error;
  }
}
