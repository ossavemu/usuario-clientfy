import { deleteInstance, getInstanceIp } from '@/lib/turso/instance';
import { NextResponse } from 'next/server';

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
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const ip = await getInstanceIp(email);

    if (!ip) {
      return NextResponse.json({ exists: false });
    }

    // Verificar si el panel está activo
    const isActive = await checkPanel(ip);

    if (!isActive) {
      // Si el panel no está activo, eliminamos la instancia de Turso
      await deleteInstance(email);
      return NextResponse.json({ exists: false });
    }

    // Verificar si hay QR activo solo si el panel está activo
    try {
      const qrResponse = await fetch(`http://${ip}:3008`);
      const hasQr = qrResponse.status === 200;

      return NextResponse.json({
        exists: true,
        ip,
        isActive: true,
        hasQr,
      });
    } catch (error) {
      console.error('Error al verificar QR:', error);
      return NextResponse.json({
        exists: true,
        ip,
        isActive: true,
        hasQr: false,
      });
    }
  } catch (error) {
    console.error('Error al verificar instancia:', error);
    return NextResponse.json(
      { error: 'Error al verificar instancia' },
      { status: 500 },
    );
  }
}
