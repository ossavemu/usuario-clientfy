import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { saveInstanceIp } from '@/lib/turso/instance';

export async function POST(request: Request) {
  try {
    const { email, ip } = await request.json();
    if (!email || !ip) throw new Error('Se requiere email e IP');
    await saveInstanceIp(email, ip);
    return jsonSuccess({
      success: true,
      message: 'Instancia guardada exitosamente',
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Error al guardar la instancia',
      500,
    );
  }
}
