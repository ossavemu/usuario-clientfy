export async function deleteDroplet(dropletName: string): Promise<boolean> {
  try {
    const DO_TOKEN = process.env.DO_TOKEN;
    if (!DO_TOKEN) {
      throw new Error('DO_TOKEN no configurado');
    }
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
      (d: { id: number; name: string }) => d.name === dropletName,
    );
    if (!droplet) {
      return true;
    }
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
    return true;
  } catch {
    return false;
  }
}
