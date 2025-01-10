import { BlobSASPermissions, BlobServiceClient } from "@azure/storage-blob";

interface AzureError {
  statusCode: number;
  message?: string;
}

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);
const containerName = "user-files";
const promptContainerName = "prompts";

export async function uploadImage(
  file: Buffer,
  fileName: string,
  phoneNumber: string
) {
  try {
    console.log("Iniciando subida de imagen:", { fileName, phoneNumber });

    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Crear contenedor si no existe, sin acceso público
    await containerClient.createIfNotExists();
    console.log("Contenedor verificado");

    const blobPath = `${phoneNumber}/img/${fileName}.jpg`;
    console.log("Ruta del blob:", blobPath);

    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    console.log("Subiendo archivo...");
    await blockBlobClient.upload(file, file.length, {
      blobHTTPHeaders: { blobContentType: "image/jpeg" },
    });
    console.log("Archivo subido exitosamente");

    // Generar URL con SAS token
    const startsOn = new Date();
    const expiresOn = new Date(
      new Date().valueOf() + 365 * 24 * 60 * 60 * 1000
    ); // 1 año

    const permissions = new BlobSASPermissions();
    permissions.read = true;

    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions,
      startsOn,
      expiresOn,
      contentType: "image/jpeg",
      cacheControl: "public, max-age=31536000",
    });

    console.log("URL generada:", sasUrl);
    return sasUrl;
  } catch (error) {
    console.error("Error detallado al subir imagen:", error);
    throw error;
  }
}

export async function getUserImages(phoneNumber: string) {
  try {
    console.log("Obteniendo imágenes para:", phoneNumber);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobPrefix = `${phoneNumber}/img/`;
    const blobs = containerClient.listBlobsFlat({ prefix: blobPrefix });

    const imageUrls = [];
    for await (const blob of blobs) {
      const blobClient = containerClient.getBlockBlobClient(blob.name);

      // Generar URL con SAS token
      const startsOn = new Date();
      const expiresOn = new Date(
        new Date().valueOf() + 365 * 24 * 60 * 60 * 1000
      );

      const permissions = new BlobSASPermissions();
      permissions.read = true;

      const sasUrl = await blobClient.generateSasUrl({
        permissions,
        startsOn,
        expiresOn,
        cacheControl: "public, max-age=31536000",
      });

      imageUrls.push({
        name:
          blob.name
            .split("/")
            .pop()
            ?.replace(/\.jpg$/, "") || "",
        url: sasUrl,
      });
    }

    console.log("Imágenes encontradas:", imageUrls.length);
    return imageUrls;
  } catch (error) {
    console.error("Error al obtener imágenes:", error);
    throw error;
  }
}

export async function uploadTrainingFile(
  file: Buffer,
  fileName: string,
  phoneNumber: string
) {
  try {
    console.log("Iniciando subida de archivo de entrenamiento:", {
      fileName,
      phoneNumber,
    });

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const blobPath = `${phoneNumber}/training/${fileName}`;
    console.log("Ruta del blob:", blobPath);

    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    console.log("Subiendo archivo...");
    await blockBlobClient.upload(file, file.length);
    console.log("Archivo subido exitosamente");

    const startsOn = new Date();
    const expiresOn = new Date(
      new Date().valueOf() + 365 * 24 * 60 * 60 * 1000
    ); // 1 año

    const permissions = new BlobSASPermissions();
    permissions.read = true;

    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions,
      startsOn,
      expiresOn,
    });

    console.log("URL generada:", sasUrl);
    return sasUrl;
  } catch (error) {
    console.error("Error detallado al subir archivo:", error);
    throw error;
  }
}

export async function getTrainingFiles(phoneNumber: string) {
  try {
    console.log("Obteniendo archivos de entrenamiento para:", phoneNumber);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobPrefix = `${phoneNumber}/training/`;
    const blobs = containerClient.listBlobsFlat({ prefix: blobPrefix });

    const files = [];
    for await (const blob of blobs) {
      const blobClient = containerClient.getBlockBlobClient(blob.name);

      const startsOn = new Date();
      const expiresOn = new Date(
        new Date().valueOf() + 365 * 24 * 60 * 60 * 1000
      );

      const permissions = new BlobSASPermissions();
      permissions.read = true;

      const sasUrl = await blobClient.generateSasUrl({
        permissions,
        startsOn,
        expiresOn,
      });

      files.push({
        name: blob.name.split("/").pop() || "",
        url: sasUrl,
      });
    }

    console.log("Archivos encontrados:", files.length);
    return files;
  } catch (error) {
    console.error("Error al obtener archivos:", error);
    throw error;
  }
}

export async function savePrompt(phoneNumber: string, prompt: string) {
  try {
    console.log("Guardando prompt para:", phoneNumber);

    const containerClient =
      blobServiceClient.getContainerClient(promptContainerName);
    await containerClient.createIfNotExists();

    const blobPath = `${phoneNumber}/prompt.txt`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    await blockBlobClient.upload(prompt, prompt.length, {
      blobHTTPHeaders: { blobContentType: "text/plain" },
    });

    const startsOn = new Date();
    const expiresOn = new Date(
      new Date().valueOf() + 365 * 24 * 60 * 60 * 1000
    );

    const permissions = new BlobSASPermissions();
    permissions.read = true;

    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions,
      startsOn,
      expiresOn,
    });

    return {
      success: true,
      url: sasUrl,
      prompt,
    };
  } catch (error) {
    console.error("Error al guardar prompt:", error);
    throw error;
  }
}

export async function getPrompt(phoneNumber: string) {
  try {
    console.log("Obteniendo prompt para:", phoneNumber);

    const containerClient =
      blobServiceClient.getContainerClient(promptContainerName);
    const blobPath = `${phoneNumber}/prompt.txt`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    try {
      const downloadResponse = await blockBlobClient.download(0);
      const prompt = await streamToText(downloadResponse.readableStreamBody);

      const startsOn = new Date();
      const expiresOn = new Date(
        new Date().valueOf() + 365 * 24 * 60 * 60 * 1000
      );

      const permissions = new BlobSASPermissions();
      permissions.read = true;

      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions,
        startsOn,
        expiresOn,
      });

      return {
        success: true,
        url: sasUrl,
        prompt,
      };
    } catch (error) {
      const azureError = error as AzureError;
      if (azureError.statusCode === 404) {
        return { success: false, exists: false };
      }
      throw error;
    }
  } catch (error) {
    console.error("Error al obtener prompt:", error);
    throw error;
  }
}

// Función auxiliar para convertir ReadableStream a texto
async function streamToText(
  readableStream: NodeJS.ReadableStream | undefined
): Promise<string> {
  if (!readableStream) {
    throw new Error("Stream no disponible");
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on("data", (data) => {
      chunks.push(Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    readableStream.on("error", reject);
  });
}

export async function deleteFile(
  phoneNumber: string,
  fileName: string,
  type: "image" | "training"
) {
  try {
    console.log(`Eliminando archivo ${type}:`, { fileName, phoneNumber });

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobPath =
      type === "image"
        ? `${phoneNumber}/img/${fileName}.jpg`
        : `${phoneNumber}/training/${fileName}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    const exists = await blockBlobClient.exists();
    if (!exists) {
      console.log("El archivo no existe en Azure:", blobPath);
      return { success: false, error: "Archivo no encontrado" };
    }

    await blockBlobClient.delete();
    console.log("Archivo eliminado exitosamente de Azure");

    return { success: true };
  } catch (error) {
    console.error(`Error al eliminar archivo ${type}:`, error);
    throw error;
  }
}
