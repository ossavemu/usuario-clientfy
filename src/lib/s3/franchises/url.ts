import { BUCKET_NAME } from '@/lib/constants/s3';
import { s3Client } from '@/lib/s3/setup';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function getFranchiseContractUrl(email: string) {
  const key = `franchises/${email}.pdf`;
  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
    { expiresIn: 3600 },
  );
  return url;
}
