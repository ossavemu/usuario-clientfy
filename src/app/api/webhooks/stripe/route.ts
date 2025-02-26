import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const STRIPE_WEBHOOK_SECRET = 'whsec_hLJOz9NZwXebxSebe9tVYDfWTDhSI3GA';
const API_URL = process.env.ORQUESTA_URL || 'http://137.184.34.79:3000';
const API_KEY = process.env.SECRET_KEY || '2rgIgH4GXmVzRsr8juvS3dDTxr3';

// Configurar Stripe
const stripe = new Stripe(
  'sk_test_51Q2KkUACo1meUjc7YzTRkotlHDBh5hJAXXLlFsYUejiEEJ3QRyEsVA90KOgGaZxWxN8qHivc5sbdqVxAU30YEwR50095EOj4wj',
  {
    apiVersion: '2025-02-24.acacia',
  }
);

// Desactivar el body parser automático para recibir el raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

// Función para recibir el body raw
async function getRawBody(request: Request): Promise<string> {
  const reader = request.body?.getReader();
  if (!reader) {
    return '';
  }

  const chunks: Uint8Array[] = [];
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      chunks.push(value);
    }
  }

  const bodyBuffer = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
  return bodyBuffer.toString('utf8');
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Obtener el cuerpo raw
    const payload = await getRawBody(request);

    // Obtener la firma del encabezado
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No se encontró la firma de Stripe');
      return NextResponse.json(
        { success: false, error: 'No se encontró la firma de Stripe' },
        { status: 400 }
      );
    }

    // Verificar la firma
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('❌ Error al verificar webhook:', err);
      return NextResponse.json(
        {
          success: false,
          error: `Error de firma de webhook: ${
            err instanceof Error ? err.message : 'Error desconocido'
          }`,
        },
        { status: 400 }
      );
    }

    // Procesar solo eventos de creación de suscripción
    if (event.type === 'customer.subscription.created') {
      console.log('✅ Evento de suscripción creado recibido');

      // Obtener datos del cliente
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Obtener el cliente para conseguir su email
      const customer = await stripe.customers.retrieve(customerId);

      if (!customer || customer.deleted) {
        throw new Error('Cliente no encontrado o eliminado');
      }

      const email = customer.email;

      if (!email) {
        throw new Error('El cliente no tiene email');
      }

      console.log(`📧 Email del cliente: ${email}`);

      // Llamar a la API para generar la contraseña
      const response = await fetch(`${API_URL}/api/password/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error en la API de generación de contraseña: ${errorText}`
        );
      }

      const data = await response.json();
      console.log('✅ Contraseña generada correctamente:', data);

      return NextResponse.json({ success: true, received: true });
    }

    // Para otros eventos, simplemente confirmamos recepción
    console.log(`⚠️ Evento no procesado: ${event.type}`);
    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Error interno: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`,
      },
      { status: 500 }
    );
  }
}
