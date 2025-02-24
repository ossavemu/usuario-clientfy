import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const API_URL = process.env.ORQUESTA_URL;
const API_KEY = process.env.SECRET_KEY;

function sanitizePhone(phone: string): string {
  return phone.toLowerCase().replace(/[^0-9]/g, '');
}

const getProgressByStatus = (status: string): number => {
  switch (status) {
    case 'creating':
      return 0;
    case 'creating_droplet':
      return 25;
    case 'waiting_for_ssh':
      return 50;
    case 'configuring':
      return 75;
    case 'completed':
      return 100;
    default:
      return 0;
  }
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const phoneParam = request.nextUrl.searchParams.get('phone');

    if (!phoneParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Número de teléfono requerido',
          data: {
            status: 'error',
            progress: 0,
          },
        },
        { status: 400 }
      );
    }

    if (!API_URL) {
      throw new Error('ORQUESTA_URL no está configurada');
    }

    const cleanPhone = sanitizePhone(phoneParam);

    console.log('\n📡 Monitoreando estado de la instancia...');
    console.log('📱 Número:', phoneParam);
    console.log('🤖 Hostname:', `bot-${cleanPhone}`);
    console.log('🌐 URL:', `${API_URL}/api/instance/status/${cleanPhone}`);

    const response = await fetch(
      `${API_URL}/api/instance/status/${cleanPhone}`,
      {
        headers: {
          'x-api-key': API_KEY || '',
        },
      }
    );

    console.log('📡 Estado de la respuesta:', response.status);
    const data = await response.json();
    console.log('📦 Datos recibidos:', data);

    if (!response.ok || !data.success) {
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          data: {
            status: 'creating',
            progress: 0,
          },
        });
      }

      const errorMessage =
        data.error || `Error del servidor: ${response.status}`;
      console.error('\n❌ Error:', errorMessage);
      return NextResponse.json({
        success: false,
        error: errorMessage,
        data: {
          status: 'error',
          progress: 0,
        },
      });
    }

    const { status } = data.data;
    const progress = getProgressByStatus(status);

    console.log(`\n⏱️ Estado: ${status} (${progress}%)`);

    if (data.data.instanceInfo?.ip) {
      console.log(`🌐 IP: ${data.data.instanceInfo.ip}`);
    }

    if (status === 'completed') {
      console.log('\n✅ ¡Instancia creada exitosamente!');
    } else if (status === 'failed') {
      console.error('\n❌ Error en la creación:', data.data.error);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data.data,
        progress,
      },
    });
  } catch (error) {
    console.error('❌ Error crítico:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({
      success: false,
      error: errorMessage,
      data: {
        status: 'error',
        progress: 0,
      },
    });
  }
}
