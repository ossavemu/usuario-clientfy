import type { ResultSet, Value } from '@libsql/client';
import { executeQuery } from './client';
import type { User } from './schemas';
import { UserSchema } from './schemas';

// Funciones para manipular usuarios
export async function getUser(email: string): Promise<User | null> {
  try {
    const result = await executeQuery<ResultSet>(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const userData = result.rows[0];
    // Analizar campos JSON
    if (userData.images && typeof userData.images === 'string') {
      try {
        userData.images = JSON.parse(userData.images as string);
      } catch (error) {
        console.error('Error al parsear images:', error);
        userData.images = JSON.stringify([]);
      }
    }
    if (
      userData.training_files &&
      typeof userData.training_files === 'string'
    ) {
      try {
        userData.training_files = JSON.parse(userData.training_files as string);
      } catch (error) {
        console.error('Error al parsear training_files:', error);
        userData.training_files = JSON.stringify([]);
      }
    }

    // Validar con Zod
    return UserSchema.parse(userData);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
}

export async function saveUser(
  user: Partial<User> & { email: string },
): Promise<boolean> {
  try {
    // Verificar si el usuario existe
    const existingUser = await getUser(user.email);

    // Preparar datos (asegurarse de que los objetos estén en formato JSON para SQLite)
    const userData: Record<string, Value> = {};

    // Copiar propiedades primitivas
    Object.entries(user).forEach(([key, value]) => {
      if (value === undefined) return;

      // Manejar arrays como JSON
      if (Array.isArray(value)) {
        userData[key] = JSON.stringify(value);
      }
      // Manejo de propiedades primitivas
      else if (
        value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        userData[key] = value as Value;
      }
      // Convertir objetos a JSON
      else if (typeof value === 'object') {
        userData[key] = JSON.stringify(value);
      }
    });

    if (existingUser) {
      // Actualizar usuario existente
      const fields = Object.keys(userData).filter((key) => key !== 'email');
      if (fields.length === 0) return true;

      const setClause = fields.map((field) => `${field} = ?`).join(', ');
      const values = fields.map((field) => userData[field]);

      // Añadir updated_at y email al final
      const query = `
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE email = ?
      `;

      await executeQuery(query, [...values, user.email]);
    } else {
      // Crear nuevo usuario
      const fields = Object.keys(userData);
      const placeholders = fields.map(() => '?').join(', ');
      const values = fields.map((field) => userData[field]);

      const query = `
        INSERT INTO users (${fields.join(', ')})
        VALUES (${placeholders})
      `;

      await executeQuery(query, values);
    }

    return true;
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    return false;
  }
}

// Gestión de atributos específicos del usuario
export async function getUserPhone(email: string): Promise<{
  phone: string;
  countryCode: string;
  serviceType: string;
} | null> {
  try {
    const result = await executeQuery<ResultSet>(
      'SELECT phone, country_code, service_type FROM users WHERE email = ?',
      [email],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const userData = result.rows[0];
    return {
      phone: userData.phone as string,
      countryCode: userData.country_code as string,
      serviceType: userData.service_type as string,
    };
  } catch (error) {
    console.error('Error al obtener teléfono:', error);
    return null;
  }
}

export async function saveUserPhone(
  email: string,
  phone: string,
  countryCode: string,
  serviceType: string,
): Promise<boolean> {
  try {
    const query = `
      UPDATE users 
      SET phone = ?, country_code = ?, service_type = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE email = ?
    `;

    await executeQuery(query, [phone, countryCode, serviceType, email]);
    return true;
  } catch (error) {
    console.error('Error al guardar teléfono:', error);
    return false;
  }
}

export async function deleteUserPhone(email: string): Promise<boolean> {
  try {
    const query = `
      UPDATE users 
      SET phone = NULL, country_code = NULL, service_type = NULL, updated_at = CURRENT_TIMESTAMP 
      WHERE email = ?
    `;

    await executeQuery(query, [email]);
    return true;
  } catch (error) {
    console.error('Error al eliminar teléfono:', error);
    return false;
  }
}

export async function getUserAddress(email: string): Promise<string | null> {
  try {
    const result = await executeQuery<ResultSet>(
      'SELECT address FROM users WHERE email = ?',
      [email],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].address as string;
  } catch (error) {
    console.error('Error al obtener dirección:', error);
    return null;
  }
}

export async function saveUserAddress(
  email: string,
  address: string,
): Promise<boolean> {
  try {
    const query = `
      UPDATE users 
      SET address = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE email = ?
    `;

    await executeQuery(query, [address, email]);
    return true;
  } catch (error) {
    console.error('Error al guardar dirección:', error);
    return false;
  }
}

export async function deleteUserAddress(email: string): Promise<boolean> {
  try {
    const query = `
      UPDATE users 
      SET address = NULL, updated_at = CURRENT_TIMESTAMP 
      WHERE email = ?
    `;

    await executeQuery(query, [email]);
    return true;
  } catch (error) {
    console.error('Error al eliminar dirección:', error);
    return false;
  }
}
