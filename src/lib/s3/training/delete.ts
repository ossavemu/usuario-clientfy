import { BUCKET_NAME } from '@/lib/constants/s3';
import { s3Client } from '@/lib/s3/setup';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

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
