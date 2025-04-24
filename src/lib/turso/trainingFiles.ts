import type { ResultSet } from '@libsql/client';
import { executeQuery } from './client';
import { getUser, saveUser } from './operations';

interface TrainingFile {
  id: string;
  name: string;
  url: string;
}

// Guardar training files para un usuario
export async function saveTrainingFiles(
  email: string,
  files: TrainingFile[],
): Promise<boolean> {
  try {
    // Obtener el usuario actual
    const user = await getUser(email);
    if (!user) {
      console.error('Usuario no encontrado:', email);
      return false;
    }

    // Actualizar la lista de training files
    const updatedUser = {
      ...user,
      training_files: files,
    };

    // Guardar usuario actualizado
    return await saveUser(updatedUser);
  } catch (error) {
    console.error('Error al guardar training files:', error);
    return false;
  }
}

// Obtener training files de un usuario
export async function getTrainingFiles(email: string): Promise<TrainingFile[]> {
  try {
    // Obtener usuario
    const user = await getUser(email);
    if (!user || !user.training_files) {
      return [];
    }

    // Asegurarnos de que todos los elementos tienen url
    return user.training_files
      .filter((file) => file.id && file.name)
      .map((file) => ({
        id: file.id,
        name: file.name,
        url: file.url || '',
      }));
  } catch (error) {
    console.error('Error al obtener training files:', error);
    return [];
  }
}

// Buscar usuario por número de teléfono
export async function getUserByPhone(
  phoneNumber: string,
): Promise<string | null> {
  try {
    // Eliminar el signo + si existe
    const cleanPhone = phoneNumber.replace(/^\+/, '');

    const result = await executeQuery<ResultSet>(
      'SELECT email FROM users WHERE phone = ? OR phone = ?',
      [phoneNumber, cleanPhone],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].email as string;
  } catch (error) {
    console.error('Error al buscar usuario por teléfono:', error);
    return null;
  }
}
