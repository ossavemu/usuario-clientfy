import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

interface Droplet {
  id: number;
  name: string;
}

async function deleteDroplet(dropletName: string): Promise<boolean> {
  try {
    const DO_TOKEN = process.env.DO_TOKEN;
    if (!DO_TOKEN) {
      throw new Error('DO_TOKEN no configurado');
    }

    // 1. Obtener lista de droplets
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
      throw new Error('Error al obtener droplets');
    }

    const dropletsData = await dropletsResponse.json();
    const droplet = dropletsData.droplets.find(
      (d: Droplet) => d.name === dropletName,
    );

    if (!droplet) {
      console.log('No se encontró el droplet:', dropletName);
      return true; // Consideramos éxito si no existe
    }

    // 2. Borrar el droplet
    const deleteResponse = await fetch(
      `https://api.digitalocean.com/v2/droplets/${droplet.id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${DO_TOKEN}`,
        },
      },
    );

    if (!deleteResponse.ok) {
      throw new Error('Error al eliminar droplet');
    }

    console.log('✅ Droplet eliminado correctamente:', dropletName);
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar droplet:', error);
    return false;
  }
}

export async function DELETE(request: Request) {
  try {
    const { email, numberphone } = await request.json();

    if (!email && !numberphone) {
      return NextResponse.json(
        { error: 'Se requiere email o número de teléfono' },
        { status: 400 },
      );
    }

    // Si tenemos el número, intentamos borrar el droplet
    if (numberphone) {
      const dropletName = `bot-${numberphone.replace('+', '')}`;
      await deleteDroplet(dropletName);
    }

    // Si tenemos el email, borramos de Redis
    if (email) {
      await redis.del(`instance:${email}`);
      console.log('✅ Registro eliminado de Redis para:', email);
    }

    return NextResponse.json({
      success: true,
      message: 'Instancia eliminada correctamente',
    });
  } catch (error) {
    console.error('❌ Error al eliminar la instancia:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la instancia' },
      { status: 500 },
    );
  }
}
