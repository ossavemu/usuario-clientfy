import { BUCKET_NAME } from '@/lib/constants/s3';
import { s3Client } from '@/lib/s3/setup';
import type { _Object } from '@aws-sdk/client-s3';
import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
