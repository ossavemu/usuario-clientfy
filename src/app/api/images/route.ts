import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { requireParam } from '@/lib/api/requireParam';
import { getUserFiles } from '@/lib/s3/training/get';
import { uploadFile } from '@/lib/s3/training/upload';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const names = formData.getAll('names') as string[];
    const phoneNumber = formData.get('phoneNumber') as string;
    if (!files.length || !phoneNumber)
      throw new Error('Se requieren archivos y número de teléfono');
    const uploadPromises = files.map(async (file, index) => {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${names[index] || file.name}.jpg`;
        const result = await uploadFile(buffer, fileName, phoneNumber, 'image');
        return { success: true, url: result.url };
      } catch {
        return { success: false, error: 'Error al subir la imagen' };
      }
    });
    const results = await Promise.all(uploadPromises);
    const allSuccessful = results.every((r) => r.success);
    const urls = results.filter((r) => r.success).map((r) => r.url);
    if (!allSuccessful) {
      return jsonError('Algunas imágenes no pudieron ser subidas', 207, {
        urls,
      });
    }
    return jsonSuccess({ success: true, urls });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Error al subir las imágenes',
      500,
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = requireParam(
      { phoneNumber: searchParams.get('phoneNumber') },
      'phoneNumber',
    );
    const result = await getUserFiles(phoneNumber, 'image');
    return jsonSuccess({ success: true, images: result.files });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Error al obtener las imágenes',
      500,
    );
  }
}
