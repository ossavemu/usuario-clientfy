import { getTrainingFiles, uploadTrainingFile } from "@/lib/azureStorage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const names = formData.getAll("names") as string[];
    const phoneNumber = formData.get("phoneNumber") as string;

    if (!files.length || !phoneNumber) {
      return NextResponse.json(
        { error: "Se requieren archivos y número de teléfono" },
        { status: 400 }
      );
    }

    const uploadPromises = files.map(async (file, index) => {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = names[index] || file.name;
        const url = await uploadTrainingFile(buffer, fileName, phoneNumber);
        return { success: true, url, name: fileName };
      } catch (error) {
        console.error(`Error al subir archivo ${file.name}:`, error);
        return { success: false, error: "Error al subir el archivo" };
      }
    });

    const results = await Promise.all(uploadPromises);

    const allSuccessful = results.every((r) => r.success);
    const successfulFiles = results
      .filter((r) => r.success)
      .map((r) => ({
        name: r.name,
        url: r.url,
      }));

    if (!allSuccessful) {
      return NextResponse.json(
        {
          error: "Algunos archivos no pudieron ser subidos",
          files: successfulFiles,
        },
        { status: 207 }
      );
    }

    return NextResponse.json({ success: true, files: successfulFiles });
  } catch (error) {
    console.error("Error en POST /api/training-files:", error);
    return NextResponse.json(
      {
        error: "Error al subir los archivos",
        details: error,
      },
      { status: 500 }
    );
  }
}

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

    const files = await getTrainingFiles(phoneNumber);
    return NextResponse.json({ success: true, files });
  } catch (error: unknown) {
    console.error("Error en GET /api/training-files:", error);
    return NextResponse.json(
      {
        error: "Error al obtener los archivos",
        details: error,
      },
      { status: 500 }
    );
  }
}
