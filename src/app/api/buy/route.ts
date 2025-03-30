import try$ from '@/lib/try';
import { NextResponse } from 'next/server';

export async function GET() {
  const [error, stripeLink] = await try$(() => {
    const link = process.env.STRIPE_PRODUCT_LINK;
    if (!link) throw new Error('No se encontró el enlace de pago');
    return link;
  });

  if (error) {
    return NextResponse.json(
      { error: 'Error al obtener el enlace de pago' },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: stripeLink });
}
