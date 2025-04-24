import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      return NextResponse.json(
        { message: 'Error de configuración del servidor' },
        { status: 500 },
      );
    }

    if (password !== correctPassword) {
      return NextResponse.json(
        { message: 'Contraseña incorrecta' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { message: 'Autenticación exitosa' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error en la autenticación:', error);
    return NextResponse.json(
      { message: 'Error en el servidor' },
      { status: 500 },
    );
  }
}
