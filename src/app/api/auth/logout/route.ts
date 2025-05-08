import { deleteSession } from '@/dal/logged';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { clearUserCookie } from '@/lib/session/user';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return jsonError('Email no proporcionado', 400);
    }

    try {
      // Eliminar la sesión de la base de datos
      await deleteSession(email);

      // Eliminar la cookie de sesión
      await clearUserCookie();

      return jsonSuccess({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return jsonError('Error al cerrar sesión', 500);
    }
  } catch (error) {
    console.error('Error en logout:', error);
    return jsonError('Error al cerrar sesión', 500);
  }
}
