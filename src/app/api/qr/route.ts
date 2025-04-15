import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');

  if (!ip) {
    return NextResponse.json({ error: 'IP requerida' }, { status: 400 });
  }

  try {
    const qrResponse = await fetch(`http://${ip}:3008`);

    if (!qrResponse.ok) {
      throw new Error('Error al obtener el QR');
    }

    const imageBuffer = await qrResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error en proxy QR:', error);
    return NextResponse.json(
      { error: 'Error al obtener el código QR' },
      { status: 500 },
    );
  }
}
