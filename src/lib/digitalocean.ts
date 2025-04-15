export async function createDroplet({
  instanceName,
  numberphone,
  companyName,
  address,
  features,
  password,
}: {
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
}) {
  const DO_API_URL = 'https://api.digitalocean.com/v2';
  const token = process.env.DO_TOKEN;
  const image = process.env.DIGITALOCEAN_IMAGE_ID;
  if (!token) throw new Error('DO_TOKEN no configurado');
  if (!image) throw new Error('DIGITALOCEAN_IMAGE_ID no configurado');

  const userData = generateUserData({
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
      size: 's-1vcpu-512mb-10gb',
      image,
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

export async function waitForDropletActive(
  dropletId: number,
  maxAttempts = 30,
) {
  const DO_API_URL = 'https://api.digitalocean.com/v2';
  const token = process.env.DO_TOKEN;
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

export function generateUserData({
  password,
  numberphone,
  companyName,
  address,
  features,
}: {
  password: string;
  numberphone: string;
  companyName: string;
  address: string;
  features: {
    virtualAppointments: boolean;
    inPersonAppointments: boolean;
    autoInvite: boolean;
  };
}) {
  return `#!/bin/bash\n\n# Configurar contraseña root y SSH\necho \"root:${password}\" | chpasswd\nsed -i 's/PermitRootLogin no/PermitRootLogin yes/' /etc/ssh/sshd_config\nsed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config\nsystemctl restart sshd\n\n# Configurar variables de entorno\nsed -i 's/^P_NUMBER=.*/P_NUMBER=${numberphone}/' /root/ClientFyAdmin/.env\nsed -i 's/^ENABLE_AUTO_INVITE=.*/ENABLE_AUTO_INVITE=${features.autoInvite}/' /root/ClientFyAdmin/.env\nsed -i 's/^ENABLE_VIRTUAL_APPOINTMENTS=.*/ENABLE_VIRTUAL_APPOINTMENTS=${features.virtualAppointments}/' /root/ClientFyAdmin/.env\nsed -i 's/^ENABLE_IN_PERSON_APPOINTMENTS=.*/ENABLE_IN_PERSON_APPOINTMENTS=${features.inPersonAppointments}/' /root/ClientFyAdmin/.env\nsed -i 's/^COMPANY_NAME=.*/COMPANY_NAME=\"${companyName}\"/' /root/ClientFyAdmin/.env\nsed -i 's/^COMPANY_ADDRESS=.*/COMPANY_ADDRESS=\"${address}\"/' /root/ClientFyAdmin/.env\n\n# Limpiar puerto si está en uso\nif lsof -i :3008 > /dev/null; then\n  kill $(lsof -t -i:3008)\nfi\n\n# Crear directorio de logs\nmkdir -p /root/ClientFyAdmin/logs\n\n# Iniciar el servidor\ncd /root/ClientFyAdmin\nnohup bun run start > /root/ClientFyAdmin/logs/server.log 2>&1 &\n\n# Señalizar que la configuración está completa\necho \"SETUP_COMPLETED=true\" > /root/setup_status.txt\n`;
}
