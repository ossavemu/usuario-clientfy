import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import { NextResponse } from 'next/server';

async function improvePromptWithAI(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_IA_API_KEY;

  if (!apiKey) {
    throw new Error('API Key de Google IA no configurada');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });

  const promptContent = `Mejora el siguiente prompt de sistema para un chatbot de ventas. IMPORTANTE: Debes generar un prompt que defina el comportamiento y personalidad del chatbot, manteniendo toda la información específica del negocio.

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

Genera SOLO el prompt mejorado, sin explicaciones adicionales.`;
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: promptContent }] }],
    });

    return result!.response.text().trim();
  } catch (error) {
    throw error;
  }
}

export async function POST(request: Request) {
  let reqData;

  try {
    reqData = await request.json();

    if (!reqData?.prompt) {
      return NextResponse.json(
        { error: 'Se requiere el prompt' },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Error al obtener los datos de la solicitud',
          details: error.message,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error al obtener los datos de la solicitud' },
      { status: 400 }
    );
  }

  try {
    const improvedPrompt = await improvePromptWithAI(reqData.prompt);
    return NextResponse.json({
      success: true,
      improvedPrompt,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Error al mejorar el prompt', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Error desconocido al mejorar el prompt' },
      { status: 500 }
    );
  }
}
