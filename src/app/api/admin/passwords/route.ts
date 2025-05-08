import {
  createServicePassword,
  deleteServicePasswordByEmail,
  findServicePasswordByEmail,
  getAllServicePasswords,
} from '@/dal/admin';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';

// GET: Obtener todas las contraseñas de servicio
export async function GET() {
  const passwords = await getAllServicePasswords();
  return jsonSuccess({ passwords });
}

// POST: Crear una nueva contraseña de servicio
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return jsonError('Email requerido', 400);
    }

    // Generar contraseña de servicio
    const password = await createServicePassword(email);

    return jsonSuccess({
      message: 'Contraseña generada exitosamente',
      password: {
        id: email,
        serviceName: email,
        password,
        createdAt: new Date().toISOString(),
      },
    });
  } catch {
    return jsonError('Error al crear contraseña', 500);
  }
}

// DELETE: Eliminar una contraseña de servicio con query parameters
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return jsonError('Email requerido', 400);
    }

    // Verificar si la contraseña existe
    const exists = await findServicePasswordByEmail(email);

    if (exists.length === 0) {
      return jsonError('Contraseña no encontrada', 404);
    }

    // Eliminar la contraseña
    await deleteServicePasswordByEmail(email);

    return jsonSuccess({
      message: 'Contraseña eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar contraseña:', error);
    return jsonError('Error al eliminar contraseña', 500);
  }
}
