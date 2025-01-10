import { deleteFile } from '@/lib/azureStorage';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');
    const fileName = searchParams.get('fileName');
    const type = searchParams.get('type') as 'image' | 'training';

    if (!phoneNumber || !fileName || !type) {
      return NextResponse.json(
        { error: 'Se requieren número de teléfono, nombre de archivo y tipo' },
        { status: 400 }
      );
    }

    if (type !== 'image' && type !== 'training') {
      return NextResponse.json(
        { error: 'Tipo de archivo inválido' },
        { status: 400 }
      );
    }

    const result = await deleteFile(phoneNumber, fileName, type);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al eliminar el archivo' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Archivo eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error en DELETE /api/files/delete:', error);
    return NextResponse.json(
      {
        error: 'Error al eliminar el archivo',
        details: error,
      },
      { status: 500 }
    );
  }
}
