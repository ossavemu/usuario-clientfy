import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { DO_SSH_PASSWORD } from '@/lib/constants/do';
import { createDroplet } from '@/lib/do/create';
import { waitForDropletActive } from '@/lib/do/wait';

export async function POST(request: Request) {
  try {
    const { numberphone, companyName, address, features } =
      await request.json();
    const cleanPhone = numberphone.replace(/\+/g, '');
    const password = DO_SSH_PASSWORD;
    if (!password) throw new Error('DIGITALOCEAN_SSH_PASSWORD no configurada');

    const instanceName = `bot-${cleanPhone}`;

    console.log('🚀 Iniciando creación de instancia:', instanceName);

    try {
      console.log('🔄 Creando droplet en DigitalOcean...');
      const droplet = await createDroplet({
        instanceName,
        numberphone: cleanPhone,
        companyName,
        address,
        features,
        password,
      });

      console.log('⏳ Esperando a que el droplet esté activo...');
      const activeDroplet = await waitForDropletActive(droplet.id);
      const ip = Array.isArray(activeDroplet.networks.v4)
        ? activeDroplet.networks.v4.find(
            (net: { type: string }) => net.type === 'public',
          )?.ip_address
        : undefined;

      if (!ip) {
        throw new Error('No se pudo obtener la IP de la instancia');
      }

      console.log('✅ Droplet activo con IP:', ip);
      console.log('🔧 Iniciando configuración del servidor...');

      return jsonSuccess({
        success: true,
        data: {
          ip,
          status: 'configuring',
          progress: 75,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en creación de instancia:', errorMessage);
      throw error;
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return jsonError(errorMessage, 500, { success: false });
  }
}
