import { setInstanceIp } from '@/lib/redis';
import { NextResponse } from 'next/server';

const ORQUESTA_URL = process.env.ORQUESTA_URL;
const API_KEY = process.env.SECRET_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body;
    console.log(payload);
    const email = body.email;

    const response = await fetch(`${ORQUESTA_URL}/api/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY!,
      },
      body: JSON.stringify(payload),
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
