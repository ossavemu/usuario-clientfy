import { NextResponse } from 'next/server';

const API_URL = 'http://localhost:3000/api';
const API_KEY = process.env.SECRET_KEY;

function sanitizeHostname(phone: string): string {
  // Eliminar caracteres no permitidos y convertir a minúsculas
  // Solo permitir: a-z, A-Z, 0-9, . y -
  return `bot-${phone.toLowerCase().replace(/[^a-zA-Z0-9.-]/g, '')}`;
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

type Props = {
  params: {
    phone: string;
  };
};

export async function GET(
  _request: Request,
  props: Props
): Promise<NextResponse> {
  try {
    const phone = props.params.phone;
    const sanitizedPhone = sanitizeHostname(phone);

    console.log('\n📡 Monitoreando estado de la instancia...');
    console.log('📱 Número:', phone);
    console.log('🤖 Hostname:', sanitizedPhone);

    const response = await fetch(
      `${API_URL}/instance/status/${sanitizedPhone}`,
      {
        headers: {
          'x-api-key': API_KEY || '',
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
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

    // Solo mostrar cambios de estado o progreso
    console.log(`\n⏱️ Estado: ${status} (${progress}%)`);

    if (data.data.instanceInfo?.ip) {
      console.log(`🌐 IP: ${data.data.instanceInfo.ip}`);
    }

    // Estados finales
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
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    console.error('\n❌ Error al verificar estado:', errorMessage);
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
