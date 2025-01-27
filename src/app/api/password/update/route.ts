import { redis } from '@/lib/redis';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar el token en Redis
    const resetInfo = await redis.get(`reset:${token}`);
    if (!resetInfo) {
      return NextResponse.json(
        { success: false, message: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    const { email } = JSON.parse(resetInfo);

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en Redis
    const userStr = await redis.hget('users', email);
    if (!userStr) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const user = JSON.parse(userStr);
    user.password = hashedPassword;

    // Guardar usuario actualizado
    await redis.hset('users', email, JSON.stringify(user));

    // Eliminar el token de reset
    await redis.del(`reset:${token}`);

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    return NextResponse.json(
      { success: false, message: 'Error al actualizar la contraseña' },
      { status: 500 }
    );
  }
}
