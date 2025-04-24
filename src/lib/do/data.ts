interface DOUserData {
  password: string;
  numberphone: string;
  companyName: string;
  address: string;
  features: {
    virtualAppointments: boolean;
    inPersonAppointments: boolean;
    autoInvite: boolean;
  };
}

export function generateData({
  password,
  numberphone,
  companyName,
  address,
  features,
}: DOUserData) {
  return `#!/bin/bash\n\n# Configurar contraseña root y SSH\necho \"root:${password}\" | chpasswd\nsed -i 's/PermitRootLogin no/PermitRootLogin yes/' /etc/ssh/sshd_config\nsed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config\nsystemctl restart sshd\n\n# Configurar variables de entorno\nsed -i 's/^P_NUMBER=.*/P_NUMBER=${numberphone}/' /root/ClientFyAdmin/.env\nsed -i 's/^ENABLE_AUTO_INVITE=.*/ENABLE_AUTO_INVITE=${features.autoInvite}/' /root/ClientFyAdmin/.env\nsed -i 's/^ENABLE_VIRTUAL_APPOINTMENTS=.*/ENABLE_VIRTUAL_APPOINTMENTS=${features.virtualAppointments}/' /root/ClientFyAdmin/.env\nsed -i 's/^ENABLE_IN_PERSON_APPOINTMENTS=.*/ENABLE_IN_PERSON_APPOINTMENTS=${features.inPersonAppointments}/' /root/ClientFyAdmin/.env\nsed -i 's/^COMPANY_NAME=.*/COMPANY_NAME=\"${companyName}\"/' /root/ClientFyAdmin/.env\nsed -i 's/^COMPANY_ADDRESS=.*/COMPANY_ADDRESS=\"${address}\"/' /root/ClientFyAdmin/.env\n\n# Limpiar puerto si está en uso\nif lsof -i :3008 > /dev/null; then\n  kill $(lsof -t -i:3008)\nfi\n\n# Crear directorio de logs\nmkdir -p /root/ClientFyAdmin/logs\n\n# Iniciar el servidor\ncd /root/ClientFyAdmin\nnohup bun run start > /root/ClientFyAdmin/logs/server.log 2>&1 &\n\n# Señalizar que la configuración está completa\necho \"SETUP_COMPLETED=true\" > /root/setup_status.txt\n`;
}
