import { deleteUserPhone as deleteTursoPhone } from '@/lib/turso/operations';

export async function deleteUserPhone(email: string) {
  try {
    return await deleteTursoPhone(email);
  } catch (error) {
    console.error('Error al eliminar teléfono de la base de datos:', error);
    throw error;
  }
}
