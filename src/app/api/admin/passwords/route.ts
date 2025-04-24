import { executeQuery } from '@/lib/turso/client';
import { createServicePassword } from '@/lib/turso/servicePassword';
import { NextResponse } from 'next/server';

// GET: Obtener todas las contraseñas de servicio
export async function GET() {
  try {
    const result = await executeQuery(
      'SELECT email as id, email as serviceName, password, created_at as createdAt FROM service_passwords ORDER BY created_at DESC',
    );

    return NextResponse.json({
      passwords: result.rows,
    });
  } catch {
    return NextResponse.json(
      { message: 'Error al obtener contraseñas' },
      { status: 500 },
    );
  }
}

// POST: Crear una nueva contraseña de servicio
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email requerido' }, { status: 400 });
    }

    // Generar contraseña de servicio
    const password = await createServicePassword(email);

    return NextResponse.json({
      message: 'Contraseña generada exitosamente',
      password: {
        id: email,
        serviceName: email,
        password,
        createdAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { message: 'Error al crear contraseña' },
      { status: 500 },
    );
  }
}

// DELETE: Eliminar una contraseña de servicio con query parameters
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email requerido' }, { status: 400 });
    }

    // Verificar si la contraseña existe
    const existsResult = await executeQuery(
      'SELECT email FROM service_passwords WHERE email = ?',
      [email],
    );

    if (existsResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Contraseña no encontrada' },
        { status: 404 },
      );
    }

    // Eliminar la contraseña
    await executeQuery('DELETE FROM service_passwords WHERE email = ?', [
      email,
    ]);

    return NextResponse.json({
      message: 'Contraseña eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar contraseña:', error);
    return NextResponse.json(
      { message: 'Error al eliminar contraseña' },
      { status: 500 },
    );
  }
}
