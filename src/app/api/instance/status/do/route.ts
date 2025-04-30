import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { requireParam } from '@/lib/api/requireParam';

interface DropletNetwork {
  ip_address: string;
  type: string;
}

interface DropletNetworks {
  v4: DropletNetwork[];
  v6: DropletNetwork[];
}

interface Droplet {
  id: number;
  name: string;
  networks: DropletNetworks;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dropletName = requireParam(
      { dropletName: searchParams.get('dropletName') },
      'dropletName',
    );
    const DO_TOKEN = process.env.DO_TOKEN;
    if (!DO_TOKEN) throw new Error('DO_TOKEN no configurado');
    const dropletsResponse = await fetch(
      'https://api.digitalocean.com/v2/droplets',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DO_TOKEN}`,
        },
      },
    );
    if (!dropletsResponse.ok) {
      const errorText = await dropletsResponse.text();
      return jsonError(
        'Error consultando DigitalOcean',
        dropletsResponse.status,
        { details: errorText },
      );
    }
    const dropletsData = await dropletsResponse.json();
    const droplets: Droplet[] = dropletsData.droplets;
    const foundDroplet = droplets.find((d) => d.name === dropletName);
    if (!foundDroplet) {
      return jsonError('Droplet no encontrado', 404, { success: false });
    }
    const publicNetwork = foundDroplet.networks.v4.find(
      (net: DropletNetwork) => net.type === 'public',
    );
    if (!publicNetwork) {
      return jsonError('IP pública no encontrada', 404, { success: false });
    }
    const ip = publicNetwork.ip_address;
    return jsonSuccess({ success: true, ip });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Error al obtener la IP',
      500,
      { details: error },
    );
  }
}
