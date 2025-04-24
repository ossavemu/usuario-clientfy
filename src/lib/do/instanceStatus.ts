interface InstanceStatus {
  status: string;
  progress: number;
  error?: string;
  instanceInfo?: {
    ip: string | null;
    instanceName: string;
    state: string;
  };
}

export async function checkInstanceStatus(
  phone: string,
): Promise<InstanceStatus> {
  const cleanPhone = phone.replace(/\+/g, '');
  const response = await fetch(
    `/api/instance/status?phone=${encodeURIComponent(cleanPhone)}`,
  );
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Error al verificar estado');
  }

  return data.data;
}

export async function monitorInstanceStatus(
  phone: string,
  onStatusChange: (status: InstanceStatus) => void,
  onError: (error: Error) => void,
  email?: string,
  maxAttempts = 60, // 5 minutos máximo (5s * 60)
): Promise<void> {
  let attempts = 0;
  let lastStatus = '';
  let lastProgress = 0;
  let ipSaved = false;

  const checkStatus = async () => {
    try {
      const instanceData = await checkInstanceStatus(phone);
      const { status, progress } = instanceData;

      // Solo notificar si hay cambios
      if (status !== lastStatus || progress !== lastProgress) {
        onStatusChange(instanceData);
        lastStatus = status;
        lastProgress = progress;

        // Si tenemos IP y email, y aún no la hemos guardado, la guardamos a través de la API
        if (email && instanceData.instanceInfo?.ip && !ipSaved) {
          try {
            const response = await fetch('/api/instance/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                ip: instanceData.instanceInfo.ip,
              }),
            });

            if (!response.ok) {
              throw new Error('Error al guardar la IP');
            }

            ipSaved = true;
          } catch (error) {
            console.error('Error al guardar IP:', error);
          }
        }
      }

      // Si está completado o falló, detener el polling
      if (status === 'completed' || status === 'failed') {
        return;
      }

      // Continuar el polling si no hemos alcanzado el máximo de intentos
      if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkStatus, 5000);
      } else {
        throw new Error('Tiempo máximo de espera excedido');
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Error desconocido'));
    }
  };

  // Iniciar el polling
  await checkStatus();
}
