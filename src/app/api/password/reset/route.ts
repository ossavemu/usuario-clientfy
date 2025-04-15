import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, servicePassword } = await request.json();

    if (!email || !servicePassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email y contraseña de servicio son requeridos',
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${process.env.ORQUESTA_URL}/api/password/reset`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.SECRET_KEY || '',
        },
        body: JSON.stringify({ email, servicePassword }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Error al procesar la solicitud',
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en reset password:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud' },
      { status: 500 },
    );
  }
}
