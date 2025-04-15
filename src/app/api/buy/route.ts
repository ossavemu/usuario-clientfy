import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const link = process.env.STRIPE_PRODUCT_LINK;
    if (!link) throw new Error('No se encontró el enlace de pago');
    return NextResponse.json({ link });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Error al obtener el enlace de pago', message: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: 'Error desconocido al obtener el enlace de pago' },
      { status: 500 },
    );
  }
}
