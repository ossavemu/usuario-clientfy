import { BUCKET_NAME, s3Client, uploadFile } from '@/lib/s3Storage';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Se requiere número de teléfono' },
        { status: 400 }
      );
    }

    // Intentar obtener el archivo directamente sin verificar si existe primero
    try {
      const getObjectCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${phoneNumber}/prompt/prompt.txt`,
      });

      const response = await s3Client.send(getObjectCommand);
      const promptContent = await response.Body?.transformToString();

      if (!promptContent) {
        throw new Error('No se pudo leer el contenido del prompt');
      }

      return NextResponse.json({
        success: true,
        prompt: promptContent,
      });
    } catch (error: any) {
      // Si el error es porque el archivo no existe, devolver 404
      if (error.name === 'NoSuchKey') {
        return NextResponse.json(
          { error: 'Prompt no encontrado' },
          { status: 404 }
        );
      }
      // Si es otro tipo de error, relanzarlo para que lo maneje el catch exterior
      throw error;
    }
  } catch (error) {
    console.error('Error en GET /api/prompt:', error);
    return NextResponse.json(
      { error: 'Error al obtener el prompt', details: error },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { phoneNumber, prompt } = await request.json();

    if (!phoneNumber || !prompt) {
      return NextResponse.json(
        { error: 'Se requieren número de teléfono y prompt' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(prompt, 'utf-8');
    const result = await uploadFile(
      buffer,
      'prompt.txt',
      phoneNumber,
      'prompt'
    );

    return NextResponse.json({
      success: true,
      message: 'Prompt guardado exitosamente',
      url: result.url,
      prompt: prompt,
    });
  } catch (error) {
    console.error('Error en POST /api/prompt:', error);
    return NextResponse.json(
      { error: 'Error al guardar el prompt', details: error },
      { status: 500 }
    );
  }
}
