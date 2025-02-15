import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    // Borrar el registro de la instancia en Redis
    await redis.del(`instance:${email}`);

    return NextResponse.json({
      success: true,
      message: 'Instancia eliminada y registro borrado de Redis',
    });
  } catch (error) {
    console.error('Error al eliminar la instancia:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la instancia' },
      { status: 500 }
    );
  }
}
