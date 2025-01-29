import { NextResponse } from 'next/server';

const API_URL = 'http://137.184.34.79:3000/api';
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

interface ApiResponse {
  success: boolean;
  error?: string;
  data: InstanceStatus;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await context.params;

    const response = await fetch(`${API_URL}/instance/status/${phone}`, {
      headers: {
        'x-api-key': API_KEY || '2rgIgH4GXmVzRsr8juvS3dDTxr3',
      },
    });

    const apiResponse = (await response.json()) as ApiResponse;

    if (!apiResponse.success) {
      return NextResponse.json({
        data: {
          status: 'error',
          progress: 0,
          error: apiResponse.error || 'Error desconocido',
        },
      });
    }

    return NextResponse.json({
      data: {
        status: apiResponse.data.status,
        progress: apiResponse.data.progress,
        error: apiResponse.data.error,
        instanceInfo: apiResponse.data.instanceInfo,
      },
    });
  } catch (error) {
    console.error('Error getting instance status:', error);
    return NextResponse.json({
      data: {
        status: 'error',
        progress: 0,
        error: 'Error al obtener el estado de la instancia',
      },
    });
  }
}
