import type { ResultSet } from '@libsql/client';
import { executeQuery } from './client';
import { SessionSchema } from './schemas';

// Guardar sesión (JWT)
export async function saveSession(
  email: string,
  token: string,
  expiresAt: Date,
): Promise<boolean> {
  try {
    // Verificar si ya existe una sesión
    const existingSession = await executeQuery<ResultSet>(
      'SELECT * FROM sessions WHERE email = ?',
      [email],
    );

    const expiresAtISO = expiresAt.toISOString();

    if (existingSession.rows.length > 0) {
      // Actualizar sesión existente
      await executeQuery(
        'UPDATE sessions SET token = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
        [token, expiresAtISO, email],
      );
    } else {
      // Crear nueva sesión
      await executeQuery(
        'INSERT INTO sessions (email, token, expires_at) VALUES (?, ?, ?)',
        [email, token, expiresAtISO],
      );
    }

    return true;
  } catch (error) {
    console.error('Error al guardar sesión:', error);
    return false;
  }
}

// Validar sesión por token
export async function validateSession(
  token: string,
): Promise<{ valid: boolean; email: string | null }> {
  try {
    const result = await executeQuery<ResultSet>(
      'SELECT * FROM sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP',
      [token],
    );

    if (result.rows.length === 0) {
      return { valid: false, email: null };
    }

    const sessionData = SessionSchema.parse(result.rows[0]);
    return { valid: true, email: sessionData.email };
  } catch (error) {
    console.error('Error al validar sesión:', error);
    return { valid: false, email: null };
  }
}

// Eliminar sesión (logout)
export async function deleteSession(email: string): Promise<boolean> {
  try {
    await executeQuery('DELETE FROM sessions WHERE email = ?', [email]);
    return true;
  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    return false;
  }
}

// Limpiar sesiones expiradas
export async function cleanExpiredSessions(): Promise<number> {
  try {
    const result = await executeQuery<ResultSet>(
      'DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP',
    );

    return result.rowsAffected || 0;
  } catch (error) {
    console.error('Error al limpiar sesiones expiradas:', error);
    return 0;
  }
}
