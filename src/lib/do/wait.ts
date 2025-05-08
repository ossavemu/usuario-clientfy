import { DO_API_URL, DO_TOKEN } from '@/lib/constants/do';

export async function waitForDropletActive(
  dropletId: number,
  maxAttempts = 30,
) {
  const token = DO_TOKEN;
  if (!token) throw new Error('DO_TOKEN no configurado');
  let attempts = 0;
  while (attempts < maxAttempts) {
    const res = await fetch(`${DO_API_URL}/droplets/${dropletId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error consultando droplet');
    const data = await res.json();
    const droplet = data.droplet;
    if (droplet?.status === 'active') return droplet;
    await new Promise((r) => setTimeout(r, 10000));
    attempts++;
  }
  throw new Error('Timeout esperando droplet activo');
}
