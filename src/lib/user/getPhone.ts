import { getUserPhone as getTursoPhone } from '@/lib/turso/operations';

export async function getUserPhone(email: string) {
  try {
    return await getTursoPhone(email);
  } catch (error) {
    console.error('Error al obtener teléfono de la base de datos:', error);
    throw error;
  }
}
