import { getPrompt, savePrompt } from '@/lib/azureStorage';
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

    const result = await getPrompt(phoneNumber);

    if (!result.success) {
      if (!result.exists) {
        return NextResponse.json(
          { error: 'Prompt no encontrado' },
          { status: 404 }
        );
      }
      throw new Error('Error al obtener el prompt');
    }

    return NextResponse.json({
      success: true,
      prompt: result.prompt,
      url: result.url,
    });
  } catch (error: any) {
    console.error('Error en GET /api/prompt:', error);
    return NextResponse.json(
      {
        error: error.message || 'Error al obtener el prompt',
        details: error.details || {},
      },
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

    const result = await savePrompt(phoneNumber, prompt);

    return NextResponse.json({
      success: true,
      message: 'Prompt guardado exitosamente',
      url: result.url,
      prompt: result.prompt,
    });
  } catch (error: any) {
    console.error('Error en POST /api/prompt:', error);
    return NextResponse.json(
      {
        error: error.message || 'Error al guardar el prompt',
        details: error.details || {},
      },
      { status: 500 }
    );
  }
}
