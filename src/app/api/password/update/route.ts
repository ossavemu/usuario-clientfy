import { ENCRYPT_ALGORITHM, SALT_ROUNDS } from '@/lib/constants/encrypt';
import { executeQuery } from '@/lib/turso/client';
import { getUser, saveUser } from '@/lib/turso/operations';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token y nueva contraseña son requeridos' },
        { status: 400 },
      );
    }

    // Verificar el token en Turso
    const result = await executeQuery(
      'SELECT * FROM password_resets WHERE token = ? AND expires_at > CURRENT_TIMESTAMP',
      [token],
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Token inválido o expirado' },
        { status: 400 },
      );
    }

    const email = result.rows[0].email as string;

    // Encriptar la nueva contraseña
    const hashedPassword = await Bun.password.hash(newPassword, {
      algorithm: ENCRYPT_ALGORITHM,
      cost: SALT_ROUNDS,
    });

    // Obtener usuario de Turso
    const user = await getUser(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 },
      );
    }

    // Actualizar contraseña
    const updatedUser = {
      ...user,
      password: hashedPassword,
    };

    // Guardar usuario actualizado
    await saveUser(updatedUser);

    // Eliminar el token de reset
    await executeQuery('DELETE FROM password_resets WHERE token = ?', [token]);

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    return NextResponse.json(
      { success: false, message: 'Error al actualizar la contraseña' },
      { status: 500 },
    );
  }
}
