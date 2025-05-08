import {
  deletePasswordResetToken,
  getUser,
  saveUser,
  verifyPasswordResetToken,
} from '@/dal/unlogged';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { ARGON2_MEMORY_COST, ENCRYPT_ALGORITHM } from '@/lib/constants/encrypt';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return jsonError('Token y nueva contraseña son requeridos', 400);
    }

    // Verificar el token usando el DAL
    const email = await verifyPasswordResetToken(token);
    if (!email) {
      return jsonError('Token inválido o expirado', 400);
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await Bun.password.hash(newPassword, {
      algorithm: ENCRYPT_ALGORITHM,
      memoryCost: ARGON2_MEMORY_COST,
    });

    // Obtener usuario
    const user = await getUser(email);
    if (!user) {
      return jsonError('Usuario no encontrado', 404);
    }

    // Actualizar contraseña
    const updatedUser = {
      ...user,
      password: hashedPassword,
    };

    await saveUser(updatedUser);

    // Eliminar el token de reset
    await deletePasswordResetToken(token);

    return jsonSuccess({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    return jsonError('Error al actualizar la contraseña', 500);
  }
}
