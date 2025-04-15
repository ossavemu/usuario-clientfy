import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const API_URL = process.env.ORQUESTA_URL;
const API_KEY = process.env.SECRET_KEY;
// Configurar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil',
});

// Desactivar el body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Este método procesa los webhooks de Stripe
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    let event: Stripe.Event;

    try {
      // Parsear el body como JSON
      const requestData = await request.json();

      // Verificar que sea un evento de Stripe válido
      if (!requestData.type || !requestData.data || !requestData.data.object) {
        throw new Error('Formato de evento inválido');
      }

      // Usar el evento sin verificación de firma (para desarrollo)
      event = requestData as Stripe.Event;
      console.log('✅ Evento recibido:', event.type);
    } catch (err) {
      console.error('❌ Error al procesar el evento:', err);
      return NextResponse.json(
        {
          success: false,
          error: 'Formato de evento inválido',
        },
        { status: 400 },
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
          'x-api-key': API_KEY as string,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error en la API de generación de contraseña: ${errorText}`,
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
      { status: 500 },
    );
  }
}
