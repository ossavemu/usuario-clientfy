import { createDroplet, waitForDropletActive } from '@/lib/digitalocean';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { numberphone, companyName, address, features } =
      await request.json();
    const cleanPhone = numberphone.replace(/\+/g, '');
    const password = process.env.DIGITALOCEAN_SSH_PASSWORD;
    if (!password) throw new Error('DIGITALOCEAN_SSH_PASSWORD no configurada');

    const instanceName = `bot-${cleanPhone}`;

    const droplet = await createDroplet({
      instanceName,
      numberphone: cleanPhone,
      companyName,
      address,
      features,
      password,
    });

    const activeDroplet = await waitForDropletActive(droplet.id);
    const ip = Array.isArray(activeDroplet.networks.v4)
      ? activeDroplet.networks.v4.find(
          (net: { type: string }) => net.type === 'public'
        )?.ip_address
      : undefined;
    if (!ip) throw new Error('No se pudo obtener la IP de la instancia');

    return NextResponse.json({
      success: true,
      data: {
        ip,
        status: 'creating',
        progress: 0,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
