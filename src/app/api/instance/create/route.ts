import { setInstanceIp } from '@/lib/redis';
import { NextResponse } from 'next/server';

const API_URL = 'http://137.184.34.79:3000/api';
const API_KEY = process.env.SECRET_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, ...requestBody } = body;

    const response = await fetch(`${API_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY || '2rgIgH4GXmVzRsr8juvS3dDTxr3',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.success && email && data.instanceInfo?.ip) {
      await setInstanceIp(email, data.instanceInfo.ip);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating instance:', error);
    return NextResponse.json(
      { error: 'Error al crear la instancia' },
      { status: 500 }
    );
  }
}
