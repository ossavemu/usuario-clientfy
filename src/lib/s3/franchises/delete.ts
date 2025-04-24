import { BUCKET_NAME } from '@/lib/constants/s3';
import { s3Client } from '@/lib/s3/setup';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function deleteFranchiseContract(email: string) {
  try {
    const key = `franchises/${email}.pdf`;
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
    );
    return { success: true };
  } catch (error) {
    console.error('Error deleting franchise contract from S3:', error);
    throw error;
  }
}
