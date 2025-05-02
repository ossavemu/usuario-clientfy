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

export async function getDropletPublicIp(dropletName: string): Promise<string> {
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
    throw new Error(errorText);
  }
  const dropletsData = await dropletsResponse.json();
  const foundDroplet = (dropletsData.droplets as Droplet[]).find(
    (d) => d.name === dropletName,
  );
  if (!foundDroplet) throw new Error('Droplet no encontrado');
  const publicNetwork = foundDroplet.networks.v4.find(
    (net) => net.type === 'public',
  );
  if (!publicNetwork) throw new Error('IP pública no encontrada');
  return publicNetwork.ip_address;
}
