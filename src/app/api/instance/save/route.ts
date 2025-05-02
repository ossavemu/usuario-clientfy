import { saveInstanceIp } from '@/dal/logged';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';

export async function POST(request: Request) {
  try {
    const { email, ipAddress } = await request.json();
    if (!email || !ipAddress) return jsonError('Email e IP requeridos', 400);
    await saveInstanceIp(email, ipAddress);
    return jsonSuccess({ success: true });
  } catch (error) {
    console.error('Error al guardar instancia:', error);
    return jsonError('Error al guardar instancia', 500);
  }
}
