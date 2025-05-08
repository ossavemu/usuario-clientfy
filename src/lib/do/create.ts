import { DO_API_URL, DO_TOKEN } from '@/lib/constants/do';
import { generateData } from './data';

interface CreateDropletProps {
  instanceName: string;
  numberphone: string;
  companyName: string;
  address: string;
  features: {
    virtualAppointments: boolean;
    inPersonAppointments: boolean;
    autoInvite: boolean;
  };
  password: string;
}

export async function createDroplet({
  instanceName,
  numberphone,
  companyName,
  address,
  features,
  password,
}: CreateDropletProps) {
  const token = DO_TOKEN;
  // const image = DO_CONFIG.IMAGE_ID;
  if (!token) throw new Error('DO_TOKEN no configurado');
  //if (!image) throw new Error('DIGITALOCEAN_IMAGE_ID no configurado');

  const userData = generateData({
    password,
    numberphone,
    companyName,
    address,
    features,
  });

  const res = await fetch(`${DO_API_URL}/droplets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: instanceName,
      region: 'sfo3',
      size: 's-1vcpu-1gb',
      //image,
      backups: false,
      ipv6: false,
      monitoring: true,
      tags: [numberphone],
      user_data: userData,
    }),
  });
  if (!res.ok) throw new Error('Error creando droplet');
  const data = await res.json();
  return data.droplet;
}
