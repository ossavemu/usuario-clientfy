import type { ResultSet } from '@libsql/client';
import { executeQuery } from './client';

// Guardar IP de instancia
export async function saveInstanceIp(
  email: string,
  ipAddress: string,
): Promise<boolean> {
  try {
    // Verificar si ya existe una instancia
    const existingInstance = await executeQuery<ResultSet>(
      'SELECT * FROM instances WHERE email = ?',
      [email],
    );

    if (existingInstance.rows.length > 0) {
      // Actualizar instancia existente
      await executeQuery(
        'UPDATE instances SET ip_address = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
        [ipAddress, email],
      );
    } else {
      // Crear nueva instancia
      await executeQuery(
        'INSERT INTO instances (email, ip_address) VALUES (?, ?)',
        [email, ipAddress],
      );
    }

    return true;
  } catch (error) {
    console.error('Error al guardar instancia:', error);
    return false;
  }
}

// Obtener IP de instancia
export async function getInstanceIp(email: string): Promise<string | null> {
  try {
    const result = await executeQuery<ResultSet>(
      'SELECT ip_address FROM instances WHERE email = ?',
      [email],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].ip_address as string;
  } catch (error) {
    console.error('Error al obtener instancia:', error);
    return null;
  }
}

// Eliminar instancia
export async function deleteInstance(email: string): Promise<boolean> {
  try {
    await executeQuery('DELETE FROM instances WHERE email = ?', [email]);
    return true;
  } catch (error) {
    console.error('Error al eliminar instancia:', error);
    return false;
  }
}

// Verificar si existe una instancia activa
export async function hasActiveInstance(email: string): Promise<boolean> {
  try {
    const ipAddress = await getInstanceIp(email);
    return ipAddress !== null;
  } catch (error) {
    console.error('Error al verificar instancia activa:', error);
    return false;
  }
}

// Obtener instancia por número de teléfono
export async function getInstanceByPhone(phone: string): Promise<{
  status: string;
  instanceInfo?: {
    ip: string;
    hostname: string;
    email: string;
  };
} | null> {
  try {
    // Buscar usuario con ese número de teléfono
    const userResult = await executeQuery<ResultSet>(
      'SELECT email FROM users WHERE phone = ?',
      [phone],
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const email = userResult.rows[0].email as string;

    // Buscar instancia del usuario
    const instanceResult = await executeQuery<ResultSet>(
      'SELECT * FROM instances WHERE email = ?',
      [email],
    );

    if (instanceResult.rows.length === 0) {
      return null;
    }

    return {
      status: 'completed',
      instanceInfo: {
        ip: instanceResult.rows[0].ip_address as string,
        hostname: `bot-${phone}`,
        email: email,
      },
    };
  } catch (error) {
    console.error('Error al buscar instancia por teléfono:', error);
    return null;
  }
}

// Obtener estado de la instancia por número de teléfono
export async function getInstanceStatus(phone: string): Promise<{
  status: string;
  instanceInfo?: {
    ip: string;
    hostname: string;
    email: string;
  };
  error?: string;
}> {
  try {
    const instance = await getInstanceByPhone(phone);

    if (!instance) {
      // Verificar si hay un proceso de creación en curso
      const processingResult = await executeQuery<ResultSet>(
        'SELECT * FROM instance_creation WHERE phone = ? ORDER BY created_at DESC LIMIT 1',
        [phone],
      );

      if (processingResult.rows.length > 0) {
        const status = processingResult.rows[0].status as string;

        if (status === 'failed') {
          return {
            status: 'failed',
            error:
              (processingResult.rows[0].error_message as string) ||
              'Error en la creación de la instancia',
          };
        }

        return {
          status: status || 'creating',
        };
      }

      return { status: 'not_found' };
    }

    return instance;
  } catch (error) {
    console.error('Error al obtener estado de instancia:', error);
    return { status: 'error', error: 'Error interno al consultar el estado' };
  }
}

// Registrar proceso de creación de instancia
export async function registerInstanceCreation(
  phone: string,
  status: string = 'creating',
): Promise<boolean> {
  try {
    await executeQuery(
      'INSERT INTO instance_creation (phone, status) VALUES (?, ?)',
      [phone, status],
    );

    return true;
  } catch (error) {
    console.error('Error al registrar creación de instancia:', error);
    return false;
  }
}

// Actualizar estado de creación de instancia
export async function updateInstanceCreationStatus(
  phone: string,
  status: string,
  errorMessage?: string,
): Promise<boolean> {
  try {
    if (errorMessage) {
      await executeQuery(
        'UPDATE instance_creation SET status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE phone = ? ORDER BY created_at DESC LIMIT 1',
        [status, errorMessage, phone],
      );
    } else {
      await executeQuery(
        'UPDATE instance_creation SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE phone = ? ORDER BY created_at DESC LIMIT 1',
        [status, phone],
      );
    }

    return true;
  } catch (error) {
    console.error('Error al actualizar estado de creación:', error);
    return false;
  }
}
