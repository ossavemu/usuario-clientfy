import { BUCKET_NAME } from '@/lib/constants/s3';
import { s3Client } from '@/lib/s3/setup';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function uploadFranchiseContract(buffer: Buffer, email: string) {
  try {
    const key = `franchises/${email}.pdf`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
      }),
    );
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
      { expiresIn: 3600 },
    );
    return { success: true, url };
  } catch (error) {
    console.error('Error uploading franchise contract to S3:', error);
    throw error;
  }
}
