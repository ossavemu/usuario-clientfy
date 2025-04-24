import { uploadFile } from '@/lib/s3/training/upload';

export async function savePrompt(phoneNumber: string, prompt: string) {
  const buffer = Buffer.from(prompt, 'utf-8');
  const result = await uploadFile(buffer, 'prompt.txt', phoneNumber, 'prompt');
  return result;
}
