import { NextResponse } from 'next/server';

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
    const dropletName = searchParams.get('dropletName');

    if (!dropletName) {
      return NextResponse.json(
        { error: 'Nombre del droplet es requerido' },
        { status: 400 }
      );
    }

    const DO_TOKEN = process.env.DO_TOKEN;
    if (!DO_TOKEN) {
      return NextResponse.json(
        { error: 'DO_TOKEN no configurado' },
        { status: 500 }
      );
    }

    // Llamar a la API de Digital Ocean para listar los droplets
    const dropletsResponse = await fetch(
      'https://api.digitalocean.com/v2/droplets',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DO_TOKEN}`,
        },
      }
    );

    if (!dropletsResponse.ok) {
      const errorText = await dropletsResponse.text();
      return NextResponse.json(
        { error: 'Error consultando DigitalOcean', details: errorText },
        { status: dropletsResponse.status }
      );
    }

    const dropletsData = await dropletsResponse.json();
    const droplets: Droplet[] = dropletsData.droplets;

    // Filtrar el droplet por nombre exacto
    const foundDroplet = droplets.find((d) => d.name === dropletName);

    if (!foundDroplet) {
      return NextResponse.json({
        success: false,
        error: 'Droplet no encontrado',
      });
    }

    // Buscar la red pública (v4) del droplet
    const publicNetwork = foundDroplet.networks.v4.find(
      (net: DropletNetwork) => net.type === 'public'
    );

    if (!publicNetwork) {
      return NextResponse.json({
        success: false,
        error: 'IP pública no encontrada',
      });
    }

    const ip = publicNetwork.ip_address;
    return NextResponse.json({ success: true, ip });
  } catch (error) {
    console.error('Error al obtener la IP desde DO:', error);
    return NextResponse.json(
      { error: 'Error al obtener la IP', details: error },
      { status: 500 }
    );
  }
}
