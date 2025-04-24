import { saveInstanceIp } from '@/lib/turso/instance';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, ip } = await request.json();

    if (!email || !ip) {
      return NextResponse.json(
        { error: 'Se requiere email e IP' },
        { status: 400 },
      );
    }

    await saveInstanceIp(email, ip);

    return NextResponse.json({
      success: true,
      message: 'Instancia guardada exitosamente',
    });
  } catch (error) {
    console.error('Error al guardar la instancia:', error);
    return NextResponse.json(
      { error: 'Error al guardar la instancia' },
      { status: 500 },
    );
  }
}
