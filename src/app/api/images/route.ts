import { getUserFiles, uploadFile } from "@/lib/s3Storage";
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
        const result = await uploadFile(buffer, fileName, phoneNumber, "image");
        return { success: true, url: result.url };
      } catch (error) {
        console.error(`Error al subir imagen ${file.name}:`, error);
        return { success: false, error: "Error al subir la imagen" };
      }
    });

    const results = await Promise.all(uploadPromises);
    const allSuccessful = results.every((r) => r.success);
    const urls = results.filter((r) => r.success).map((r) => r.url);

    if (!allSuccessful) {
      return NextResponse.json(
        {
          error: "Algunas imágenes no pudieron ser subidas",
          urls,
        },
        { status: 207 }
      );
    }

    return NextResponse.json({ success: true, urls });
  } catch (error) {
    console.error("Error en POST /api/images:", error);
    return NextResponse.json(
      { error: "Error al subir las imágenes", details: error },
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

    const result = await getUserFiles(phoneNumber, "image");
    return NextResponse.json({ success: true, images: result.files });
  } catch (error) {
    console.error("Error en GET /api/images:", error);
    return NextResponse.json(
      { error: "Error al obtener las imágenes", details: error },
      { status: 500 }
    );
  }
}
