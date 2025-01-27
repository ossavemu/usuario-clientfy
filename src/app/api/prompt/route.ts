import {
  BUCKET_NAME,
  getUserFiles,
  s3Client,
  uploadFile,
} from "@/lib/s3Storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Se requiere número de teléfono" },
        { status: 400 }
      );
    }

    const result = await getUserFiles(phoneNumber, "prompt");
    const promptFile = result.files.find((file) => file.name === "prompt.txt");

    if (!promptFile) {
      return NextResponse.json(
        { error: "Prompt no encontrado" },
        { status: 404 }
      );
    }

    // Obtener el contenido del archivo
    const getObjectCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${phoneNumber}/prompt/prompt.txt`,
    });

    const response = await s3Client.send(getObjectCommand);
    const promptContent = await response.Body?.transformToString();

    if (!promptContent) {
      throw new Error("No se pudo leer el contenido del prompt");
    }

    return NextResponse.json({
      success: true,
      prompt: promptContent,
    });
  } catch (error) {
    console.error("Error en GET /api/prompt:", error);
    return NextResponse.json(
      { error: "Error al obtener el prompt", details: error },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { phoneNumber, prompt } = await request.json();

    if (!phoneNumber || !prompt) {
      return NextResponse.json(
        { error: "Se requieren número de teléfono y prompt" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(prompt, "utf-8");
    const result = await uploadFile(
      buffer,
      "prompt.txt",
      phoneNumber,
      "prompt"
    );

    return NextResponse.json({
      success: true,
      message: "Prompt guardado exitosamente",
      url: result.url,
      prompt: prompt,
    });
  } catch (error) {
    console.error("Error en POST /api/prompt:", error);
    return NextResponse.json(
      { error: "Error al guardar el prompt", details: error },
      { status: 500 }
    );
  }
}
