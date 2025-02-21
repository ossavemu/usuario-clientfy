import { setInstanceIp } from '@/lib/redis';
import { NextResponse } from 'next/server';

const ORQUESTA_URL = process.env.ORQUESTA_URL;
const API_KEY = process.env.SECRET_KEY;

export async function POST(request: Request) {
  try {
    const { email, ...payload } = await request.json();
    console.log({ email, ...payload });

    const response = await fetch(`${ORQUESTA_URL}/api/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY!,
      },
      body: JSON.stringify({ email, ...payload }),
    });

    const data = await response.json();

    const { success, instanceInfo } = data;
    if (success && email && instanceInfo?.ip) {
      await setInstanceIp(email, instanceInfo.ip);
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
