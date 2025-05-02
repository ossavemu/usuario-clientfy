import { deleteInstance, getInstanceIp } from '@/dal/logged';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';

const timeout = (ms: number) =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });

const checkPanel = async (ip: string) => {
  try {
    const response = (await Promise.race([
      fetch(`http://${ip}:5432/panel`),
      timeout(5000),
    ])) as Response;

    return response.status === 200;
  } catch (error) {
    console.error('Error al verificar instancia:', error);
    return false;
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return jsonError('Email requerido', 400);
    }

    const ip = await getInstanceIp(email);

    if (!ip) {
      return jsonError('IP no encontrada', 404);
    }

    // Verificar si el panel está activo
    const isActive = await checkPanel(ip);

    if (!isActive) {
      // Si el panel no está activo, eliminamos la instancia de Turso
      await deleteInstance(email);
      return jsonError('IP no encontrada', 404);
    }

    // Verificar si hay QR activo solo si el panel está activo
    try {
      const qrResponse = await fetch(`http://${ip}:3008`);
      const hasQr = qrResponse.status === 200;

      return jsonSuccess({
        exists: true,
        ip,
        isActive: true,
        hasQr,
      });
    } catch (error) {
      console.error('Error al verificar QR:', error);
      return jsonSuccess({
        exists: true,
        ip,
        isActive: true,
        hasQr: false,
      });
    }
  } catch (error) {
    console.error('Error al verificar instancia:', error);
    return jsonError('Error al verificar instancia', 500);
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return jsonError('Email requerido', 400);
    const ip = await getInstanceIp(email);
    return jsonSuccess({ ip });
  } catch (error) {
    console.error('Error al obtener IP:', error);
    return jsonError('Error al obtener IP', 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return jsonError('Email requerido', 400);
    await deleteInstance(email);
    return jsonSuccess({ success: true });
  } catch (error) {
    console.error('Error al eliminar instancia:', error);
    return jsonError('Error al eliminar instancia', 500);
  }
}
