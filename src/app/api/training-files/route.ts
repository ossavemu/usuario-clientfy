import { getUserFiles } from '@/lib/s3/training/get';
import { uploadFile } from '@/lib/s3/training/upload';
import { getUserByPhone, saveTrainingFiles } from '@/lib/turso/trainingFiles';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
}

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

    // Obtener el email asociado al número
    const email = await getUserByPhone(phoneNumber);
    if (!email) {
      return NextResponse.json(
        { error: 'No se encontró un usuario asociado a este número' },
        { status: 404 },
      );
    }

    const uploadedFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const extension = file.name.split('.').pop() || '';
        const fileName = `${names[i] || file.name.split('.')[0]}.${extension}`;
        const fileId = randomUUID();

        const result = await uploadFile(
          buffer,
          fileName,
          phoneNumber,
          'training',
        );

        uploadedFiles.push({
          id: fileId,
          name: fileName,
          url: result.url,
        });
      } catch (error) {
        console.error(`Error al subir archivo ${file.name}:`, error);
        // Continuamos con los siguientes archivos
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'No se pudo subir ningún archivo' },
        { status: 400 },
      );
    }

    // Guardar en Turso
    await saveTrainingFiles(email, uploadedFiles);

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Error en POST /api/training-files:', error);
    return NextResponse.json(
      { error: 'Error al subir los archivos' },
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
      { error: 'Error al obtener los archivos' },
      { status: 500 },
    );
  }
}
