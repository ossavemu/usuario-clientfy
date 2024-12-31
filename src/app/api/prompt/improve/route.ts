import { NextResponse } from 'next/server';

async function improvePromptWithAI(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_IA_API_KEY;

  try {
    console.log('Iniciando solicitud a Gemini API...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Mejora el siguiente prompt de sistema para un chatbot de ventas. IMPORTANTE: Debes generar un prompt que defina el comportamiento y personalidad del chatbot, manteniendo toda la información específica del negocio.

El prompt debe seguir este formato general:
"Eres un vendedor experto en [producto] de [nombre de la empresa]. Tu objetivo es [objetivo principal]. Tienes acceso a [capacidades: imágenes, documentos, etc]. Manejas productos que van desde [rango de precios] y estás ubicado en [dirección]. Debes [comportamientos clave]. Al interactuar con clientes, prioriza [prioridades]. Maneja objeciones como [ejemplos]. Nunca [limitaciones/restricciones]."

Reglas para el prompt:
1. DEBE mantener toda la información específica del negocio (precios, ubicación, nombre de empresa)
2. DEBE mencionar las capacidades del bot (poder mostrar imágenes y documentos)
3. Debe definir la personalidad y comportamiento del bot
4. Debe establecer objetivos claros de venta
5. Debe incluir técnicas de venta y manejo de objeciones
6. Debe mantener un tono profesional pero amigable
7. NO debe ser un mensaje directo al cliente
8. NO debe usar formato markdown ni viñetas

Prompt original a mejorar:
${prompt}

Genera SOLO el prompt mejorado, sin explicaciones adicionales.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta de Gemini:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(
        `Error en la API de Gemini: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log('Respuesta de Gemini:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Respuesta inesperada de Gemini:', data);
      throw new Error('Formato de respuesta inválido de Gemini API');
    }

    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Error detallado al mejorar prompt con IA:', {
      error,
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(
      error instanceof Error ? error.message : 'No se pudo mejorar el prompt'
    );
  }
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Se requiere el prompt' },
        { status: 400 }
      );
    }

    console.log('API Key configurada:', !!process.env.GOOGLE_IA_API_KEY);
    const improvedPrompt = await improvePromptWithAI(prompt);

    return NextResponse.json({
      success: true,
      improvedPrompt,
    });
  } catch (error: any) {
    console.error('Error en POST /api/prompt/improve:', {
      error,
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: error.message || 'Error al mejorar el prompt',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
