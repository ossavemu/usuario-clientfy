import { setInstanceIp } from '@/lib/redis';
import { NextResponse } from 'next/server';

const API_URL = 'http://localhost:3000/api';
const API_KEY = process.env.SECRET_KEY;

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
async function monitorInstanceStatus(
  phone: string,
  maxAttempts = 60 // 5 minutos máximo (5s * 60)
): Promise<InstanceStatus | null> {
  console.log('\n📡 Monitoreando estado de la instancia...');
  console.log('📱 Número a monitorear:', phone);

  let lastStatus = '';
  let lastProgress = 0;
  let attempts = 0;
  const startTime = Date.now();

  // Asegurarnos que el número no tenga el "+"
  const cleanPhone = phone.replace('+', '');

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${API_URL}/instance/status/${cleanPhone}`, {
        headers: {
          'x-api-key': API_KEY || '',
        },
      });

      if (response.status === 404) {
        console.log(
          `\n⏳ Esperando a que la instancia esté disponible... (Intento ${
            attempts + 1
          }/${maxAttempts})`
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
        continue;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.log(
          `\n⚠️ Error temporal, reintentando... (Intento ${
            attempts + 1
          }/${maxAttempts})`
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
        continue;
      }

      const instanceData = data.data;
      const { status, progress } = instanceData;

      if (status !== lastStatus || progress !== lastProgress) {
        const timeElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n⏱️  ${timeElapsed}s - Estado: ${status} (${progress}%)`);

        if (instanceData.instanceInfo?.ip) {
          console.log(`🌐 IP: ${instanceData.instanceInfo.ip}`);
        }

        lastStatus = status;
        lastProgress = progress;
      }

      if (status === 'completed') {
        console.log('\n✅ ¡Instancia creada exitosamente!');
        return instanceData;
      } else if (status === 'failed') {
        console.error('\n❌ Error en la creación:', instanceData.error);
        return null;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    } catch (error) {
      console.error(
        '\n⚠️ Error temporal al verificar estado:',
        error instanceof Error ? error.message : 'Error desconocido'
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }
  }

  console.error('\n❌ Tiempo máximo de espera excedido');
  return null;
}

export async function POST(request: Request) {
  try {
    const { email, numberphone, companyName, address, features } =
      await request.json();

    // Asegurarnos que el número no tenga el "+"
    const cleanPhone = numberphone.replace('+', '');

    console.log('🚀 Iniciando creación de instancia');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('📱 Número original:', numberphone);
    console.log('📱 Número limpio:', cleanPhone);
    console.log('🏢 Empresa:', companyName);
    console.log('📍 Dirección:', address);
    console.log('⚙️  Configuración:', features);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const response = await fetch(`${API_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY || '',
      },
      body: JSON.stringify({
        email,
        numberphone: cleanPhone,
        companyName,
        address,
        features: {
          virtualAppointments: features.virtualAppointments || false,
          inPersonAppointments: features.inPersonAppointments || false,
          autoInvite: features.autoInvite || false,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage =
        data.error || `Error del servidor: ${response.status}`;
      console.error('\n❌ Error:', errorMessage);
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          data: null,
          estimatedTime: 240,
        },
        {
          status: response.ok ? 400 : response.status,
        }
      );
    }

    console.log('\n✅ Solicitud de creación enviada correctamente');
    console.log('⏳ Iniciando monitoreo del progreso...\n');

    const instanceData = await monitorInstanceStatus(cleanPhone);

    if (instanceData?.instanceInfo?.ip) {
      await setInstanceIp(email, instanceData.instanceInfo.ip);
      const qrUrl = `http://${instanceData.instanceInfo.ip}:3008`;

      console.log('\n🔍 Información final:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', email);
      console.log('📱 Número:', cleanPhone);
      console.log('🏢 Empresa:', companyName);
      console.log('📍 Dirección:', address);
      console.log('🌐 IP:', instanceData.instanceInfo.ip);
      console.log('🤖 Nombre:', instanceData.instanceInfo.instanceName);
      console.log('🔵 Estado:', instanceData.instanceInfo.state);
      console.log('🔗 URL del QR:', qrUrl);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n📝 Para escanear el QR:');
      console.log(`1. Abre ${qrUrl} en tu navegador`);
      console.log('2. Escanea el código QR con WhatsApp');
      console.log('3. Sigue las instrucciones en WhatsApp');

      return NextResponse.json({
        success: true,
        data: instanceData,
        estimatedTime: 240,
      });
    }

    return NextResponse.json({
      success: false,
      error:
        'No se pudo obtener la IP de la instancia después de varios intentos',
      data: null,
      estimatedTime: 240,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    console.error('\n❌ Error en la creación:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        data: null,
        estimatedTime: 240,
      },
      {
        status: 500,
      }
    );
  }
}
