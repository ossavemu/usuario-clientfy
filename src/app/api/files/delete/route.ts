import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { deleteFile } from '@/lib/s3/training/delete';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');
    const fileName = searchParams.get('fileName');
    const type = searchParams.get('type') as 'image' | 'training';

    if (!phoneNumber || !fileName || !type) {
      return jsonError('Se requieren todos los parámetros', 400);
    }

    await deleteFile(phoneNumber, fileName, type);
    return jsonSuccess({ success: true });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return jsonError('Error al eliminar el archivo', 500, {
      details: error,
    });
  }
}
