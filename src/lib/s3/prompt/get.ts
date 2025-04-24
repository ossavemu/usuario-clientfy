import { BUCKET_NAME } from '@/lib/constants/s3';
import { s3Client } from '@/lib/s3/setup';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function getPrompt(phoneNumber: string) {
  const getObjectCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${phoneNumber}/prompt/prompt.txt`,
  });
  const response = await s3Client.send(getObjectCommand);
  const promptContent = await response.Body?.transformToString();
  if (!promptContent) {
    throw new Error('No se pudo leer el contenido del prompt');
  }
  return promptContent;
}
