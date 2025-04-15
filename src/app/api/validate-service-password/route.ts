import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email y contraseña son requeridos' },
        { status: 400 },
      );
    }

    console.log(
      'Intentando validar en:',
      `${process.env.ORQUESTA_URL}/api/password/validate`,
    );

    const response = await fetch(
      `${process.env.ORQUESTA_URL}/api/password/validate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.SECRET_KEY || '',
        },
        body: JSON.stringify({ email, password }),
      },
    );

    const responseText = await response.text();
    console.log('Respuesta completa del servidor:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parseando respuesta:', e);
      return NextResponse.json(
        {
          success: false,
          isValid: false,
          message: 'Error procesando respuesta del servidor',
        },
        { status: 500 },
      );
    }

    // Si la respuesta es exitosa pero isValid es false
    if (data.success && !data.isValid) {
      return NextResponse.json({
        success: true,
        isValid: false,
        message: 'La contraseña del servicio es incorrecta',
      });
    }

    // Si todo está bien
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error completo:', error);
    return NextResponse.json(
      {
        success: false,
        isValid: false,
        message: 'Error al conectar con el servicio de validación',
      },
      { status: 500 },
    );
  }
}
