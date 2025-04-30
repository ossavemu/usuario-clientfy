import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { requireParam } from '@/lib/api/requireParam';
import { getPrompt } from '@/lib/s3/prompt/get';
import { savePrompt } from '@/lib/s3/prompt/save';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = requireParam(
      { phoneNumber: searchParams.get('phoneNumber') },
      'phoneNumber',
    );
    try {
      const promptContent = await getPrompt(phoneNumber);
      return jsonSuccess({ success: true, prompt: promptContent });
    } catch (error) {
      if (error instanceof Error && error.name === 'NoSuchKey') {
        return jsonError('Prompt no encontrado', 404);
      }
      throw error;
    }
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Error al obtener el prompt',
      500,
    );
  }
}

export async function POST(request: Request) {
  try {
    const { phoneNumber, prompt } = await request.json();
    if (!phoneNumber || !prompt)
      throw new Error('Se requieren número de teléfono y prompt');
    const result = await savePrompt(phoneNumber, prompt);
    return jsonSuccess({
      success: true,
      message: 'Prompt guardado exitosamente',
      url: result.url,
      prompt: prompt,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Error al guardar el prompt',
      500,
    );
  }
}
