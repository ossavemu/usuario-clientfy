import { getUserFiles, uploadFile } from '@/lib/s3Storage';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const names = formData.getAll('names') as string[];
    const phoneNumber = formData.get('phoneNumber') as string;

    if (!files.length || !phoneNumber) {
      return NextResponse.json(
        { error: 'Se requieren archivos y número de teléfono' },
        { status: 400 },
      );
    }

    const uploadPromises = files.map(async (file, index) => {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const extension = file.name.split('.').pop() || '';
        const fileName = `${
          names[index] || file.name.split('.')[0]
        }.${extension}`;

        const result = await uploadFile(
          buffer,
          fileName,
          phoneNumber,
          'training',
        );
        return { success: true, name: fileName, url: result.url };
      } catch (error) {
        console.error(`Error al subir archivo ${file.name}:`, error);
        return { success: false, error: 'Error al subir el archivo' };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((r) => r.success);

    if (successfulUploads.length === 0) {
      return NextResponse.json(
        { error: 'No se pudo subir ningún archivo' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      files: successfulUploads,
    });
  } catch (error) {
    console.error('Error en POST /api/training-files:', error);
    return NextResponse.json(
      { error: 'Error al subir los archivos', details: error },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Se requiere número de teléfono' },
        { status: 400 },
      );
    }

    const result = await getUserFiles(phoneNumber, 'training');
    return NextResponse.json({ success: true, files: result.files });
  } catch (error) {
    console.error('Error en GET /api/training-files:', error);
    return NextResponse.json(
      { error: 'Error al obtener los archivos', details: error },
      { status: 500 },
    );
  }
}
