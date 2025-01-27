import { deleteFile } from "@/lib/s3Storage";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");
    const fileName = searchParams.get("fileName");
    const type = searchParams.get("type") as "image" | "training";

    if (!phoneNumber || !fileName || !type) {
      return NextResponse.json(
        { error: "Se requieren todos los parámetros" },
        { status: 400 }
      );
    }

    await deleteFile(phoneNumber, fileName, type);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar archivo:", error);
    return NextResponse.json(
      { error: "Error al eliminar el archivo", details: error },
      { status: 500 }
    );
  }
}
