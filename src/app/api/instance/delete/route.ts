import { deleteInstance } from '@/dal/logged';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { deleteDroplet } from '@/lib/do/delete';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) return jsonError('Email requerido', 400);
    await deleteDroplet(email);
    await deleteInstance(email);
    return jsonSuccess({ success: true });
  } catch (error) {
    console.error('Error al eliminar instancia:', error);
    return jsonError('Error al eliminar instancia', 500);
  }
}
