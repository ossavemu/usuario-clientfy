import { getInstanceByPhone } from '@/dal/logged';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { requireParam } from '@/lib/api/requireParam';
import { DO_CONFIG } from '@/lib/config';
import type { NextRequest } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    const phoneParam = requireParam(
      { phone: request.nextUrl.searchParams.get('phone') },
      'phone',
    );
    const cleanPhone = sanitizePhone(phoneParam);
    const dropletName = `bot-${cleanPhone}`;
    const instanceData = await getInstanceByPhone(cleanPhone);
    if (instanceData) {
      return jsonSuccess({
        success: true,
        data: {
          status: 'completed',
          progress: 100,
          instanceInfo: instanceData.instanceInfo,
        },
      });
    }
    const dropletStatus = await checkDropletStatus(dropletName);
    const status = dropletStatus.status;
    const progress = getProgressByStatus(status);
    if (status === 'error' || status === 'failed') {
      const errorMessage = dropletStatus.error || 'Error desconocido';
      return jsonError(errorMessage, 500, {
        success: false,
        data: {
          status: 'error',
          progress: 0,
        },
      });
    }
    return jsonSuccess({
      success: true,
      data: {
        status,
        progress,
        instanceInfo: dropletStatus.instanceInfo,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return jsonError(errorMessage, 500, {
      success: false,
      data: {
        status: 'error',
        progress: 0,
      },
    });
  }
}
