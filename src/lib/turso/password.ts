import type { ResultSet } from '@libsql/client';
import { randomUUID } from 'crypto';
import { executeQuery } from './client';

// Crear un token de reseteo de contraseña
export async function createPasswordResetToken(
  email: string,
  expiresInHours = 24,
): Promise<string | null> {
  try {
    // Generar un token único
    const token = randomUUID();

    // Calcular la fecha de expiración
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Eliminar cualquier token existente para este email
    await executeQuery('DELETE FROM password_resets WHERE email = ?', [email]);

    // Guardar el nuevo token
    await executeQuery(
      'INSERT INTO password_resets (token, email, expires_at) VALUES (?, ?, ?)',
      [token, email, expiresAt.toISOString()],
    );

    return token;
  } catch (error) {
    console.error('Error al crear token de reseteo de contraseña:', error);
    return null;
  }
}

// Verificar si un token es válido
export async function verifyPasswordResetToken(
  token: string,
): Promise<string | null> {
  try {
    const result = await executeQuery<ResultSet>(
      'SELECT email FROM password_resets WHERE token = ? AND expires_at > CURRENT_TIMESTAMP',
      [token],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].email as string;
  } catch (error) {
    console.error('Error al verificar token de reseteo:', error);
    return null;
  }
}

// Eliminar un token de reseteo
export async function deletePasswordResetToken(
  token: string,
): Promise<boolean> {
  try {
    await executeQuery('DELETE FROM password_resets WHERE token = ?', [token]);
    return true;
  } catch (error) {
    console.error('Error al eliminar token de reseteo:', error);
    return false;
  }
}

// Limpiar tokens expirados
export async function cleanExpiredPasswordResetTokens(): Promise<number> {
  try {
    const result = await executeQuery<ResultSet>(
      'DELETE FROM password_resets WHERE expires_at < CURRENT_TIMESTAMP',
    );
    return result.rowsAffected || 0;
  } catch (error) {
    console.error('Error al limpiar tokens expirados:', error);
    return 0;
  }
}
