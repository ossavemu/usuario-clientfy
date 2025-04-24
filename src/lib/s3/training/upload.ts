import { BUCKET_NAME, MAX_FILE_SIZE } from '@/lib/constants/s3';
import { s3Client } from '@/lib/s3/setup';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
