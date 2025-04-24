import { DO_CONFIG } from '@/lib/config';
import { getInstanceByPhone } from '@/lib/turso/instance';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

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
    case 'failed':
      return 0;
    default:
      return 0;
  }
};

// Verificar estado del droplet en DigitalOcean
async function checkDropletStatus(dropletName: string): Promise<{
  status: string;
  instanceInfo?: {
    ip: string;
    hostname: string;
  };
  error?: string;
}> {
  try {
    const DO_TOKEN = DO_CONFIG.TOKEN;
    if (!DO_TOKEN) {
      throw new Error('DO_TOKEN no configurado');
    }

    // Obtener lista de droplets
    const response = await fetch('https://api.digitalocean.com/v2/droplets', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DO_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener droplets');
    }

    const data = await response.json();

    // Buscar el droplet por nombre
    const droplet = data.droplets.find(
      (d: {
        name: string;
        status: string;
        networks: {
          v4: Array<{
            type: string;
            ip_address?: string;
          }>;
        };
      }) => d.name === dropletName,
    );

    if (!droplet) {
      return { status: 'creating' };
    }

    // Verificar estado del droplet
    if (droplet.status !== 'active') {
      return { status: 'creating_droplet' };
    }

    // Obtener IP pública
    const ip = droplet.networks.v4.find(
      (net: { type: string; ip_address?: string }) => net.type === 'public',
    )?.ip_address;

    if (!ip) {
      return { status: 'waiting_for_ssh' };
    }

    // Comprobar si ya está registrada en Turso (significa que está completada)
    const instanceData = await getInstanceByPhone(
      dropletName.replace('bot-', ''),
    );

    if (instanceData) {
      return {
        status: 'completed',
        instanceInfo: {
          ip: instanceData.instanceInfo?.ip as string,
          hostname: instanceData.instanceInfo?.hostname as string,
        },
      };
    }

    // Si no está en Turso, todavía está siendo configurada
    return {
      status: 'configuring',
      instanceInfo: {
        ip,
        hostname: dropletName,
      },
    };
  } catch (error) {
    console.error('Error al verificar estado del droplet:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

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
        { status: 400 },
      );
    }

    const cleanPhone = sanitizePhone(phoneParam);
    const dropletName = `bot-${cleanPhone}`;

    console.log('\n📡 Monitoreando estado de la instancia...');
    console.log('📱 Número:', phoneParam);
    console.log('🤖 Hostname:', dropletName);

    // Verificar si ya existe una instancia registrada en Turso
    const instanceData = await getInstanceByPhone(cleanPhone);

    if (instanceData) {
      console.log('📦 Instancia encontrada en Turso:', instanceData);

      return NextResponse.json({
        success: true,
        data: {
          status: 'completed',
          progress: 100,
          instanceInfo: instanceData.instanceInfo,
        },
      });
    }

    // Si no existe en Turso, verificar el estado del droplet en DigitalOcean
    console.log('🔍 Buscando instancia en DigitalOcean...');
    const dropletStatus = await checkDropletStatus(dropletName);
    console.log('📦 Estado del droplet:', dropletStatus);

    const status = dropletStatus.status;
    const progress = getProgressByStatus(status);

    if (status === 'error' || status === 'failed') {
      const errorMessage = dropletStatus.error || 'Error desconocido';
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

    console.log(`\n⏱️ Estado: ${status} (${progress}%)`);

    if (dropletStatus.instanceInfo?.ip) {
      console.log(`🌐 IP: ${dropletStatus.instanceInfo.ip}`);
    }

    if (status === 'completed') {
      console.log('\n✅ ¡Instancia creada exitosamente!');
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        progress,
        instanceInfo: dropletStatus.instanceInfo,
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
