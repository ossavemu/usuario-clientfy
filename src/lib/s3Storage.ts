import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type _Object,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB en bytes

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  phoneNumber: string,
  type: 'image' | 'training' | 'prompt' = 'image',
) {
  try {
    if (type === 'training' && buffer.length > MAX_FILE_SIZE) {
      throw new Error('El archivo excede el tamaño máximo permitido de 6MB');
    }

    const key = `${phoneNumber}/${type}/${fileName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
      }),
    );

    // Generar URL firmada con 1 hora de expiración
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 3600 },
    );

    return { success: true, url };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

export async function getUserFiles(
  phoneNumber: string,
  type: 'image' | 'training' | 'prompt' = 'image',
) {
  try {
    const files = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: `${phoneNumber}/${type}/`,
      }),
    );

    if (!files.Contents) {
      return { success: true, files: [] };
    }

    const filesWithUrls = await Promise.all(
      files.Contents.map(async (file: _Object) => {
        const fileName = file.Key!.split('/').pop()!;
        // Extraer el nombre base sin extensión para el campo 'name'
        const name = fileName.replace(/\.[^/.]+$/, '');
        const url = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: file.Key,
          }),
          { expiresIn: 3600 },
        );
        return { name, url };
      }),
    );

    return { success: true, files: filesWithUrls };
  } catch (error) {
    console.error('Error getting files from S3:', error);
    throw error;
  }
}

export async function deleteFile(
  phoneNumber: string,
  fileName: string,
  type: 'image' | 'training' | 'prompt' = 'image',
) {
  try {
    const key = `${phoneNumber}/${type}/${fileName}`;

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
    );

    return { success: true };
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
}
