import type { ResultSet } from '@libsql/client';
import { randomUUID } from 'crypto';
import { executeQuery } from './client';

// Generador de contraseña aleatoria
const generateRandomPassword = (length = 8): string => {
  return randomUUID().replace(/-/g, '').slice(0, length);
};

// Crear o actualizar contraseña de servicio
export async function createServicePassword(email: string): Promise<string> {
  const password = generateRandomPassword();
  try {
    await executeQuery('PRAGMA foreign_keys = OFF');
    const result = await executeQuery<ResultSet>(
      'SELECT * FROM service_passwords WHERE email = ?',
      [email],
    );

    if (result.rows.length > 0) {
      await executeQuery(
        'UPDATE service_passwords SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
        [password, email],
      );
    } else {
      await executeQuery(
        'INSERT INTO service_passwords (email, password) VALUES (?, ?)',
        [email, password],
      );
    }
    await executeQuery('PRAGMA foreign_keys = ON');
  } catch (error) {
    console.error('Error al crear/actualizar contraseña de servicio:', error);
  }
  return password;
}

// Obtener contraseña de servicio
export async function getServicePassword(
  email: string,
): Promise<string | null> {
  try {
    const result = await executeQuery<ResultSet>(
      'SELECT password FROM service_passwords WHERE email = ?',
      [email],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].password as string;
  } catch (error) {
    console.error('Error al obtener contraseña de servicio:', error);
    return null;
  }
}

// Verificar contraseña de servicio
export async function validateServicePassword(
  email: string,
  password: string,
): Promise<boolean> {
  try {
    const storedPassword = await getServicePassword(email);

    if (!storedPassword) {
      return false;
    }

    return storedPassword === password;
  } catch (error) {
    console.error('Error al validar contraseña de servicio:', error);
    return false;
  }
}
