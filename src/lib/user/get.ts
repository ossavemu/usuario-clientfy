import { getUser as getTursoUser } from '@/lib/turso/operations';

export async function getUser(email: string) {
  try {
    return await getTursoUser(email);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
}
