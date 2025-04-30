import { jsonError } from '@/lib/api/jsonResponse';
import { BUCKET_NAME } from '@/lib/constants/s3';
import { s3Client } from '@/lib/s3/setup';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function GET(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey || apiKey !== process.env.API_SECRET) {
    return jsonError('No autorizado', 401);
  }
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'secret/calendar/CREDENTIALS.json',
    });
    const response = await s3Client.send(command);
    const body = await response.Body?.transformToString();
    if (!body) return jsonError('Archivo no encontrado', 404);
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return jsonError('Error interno', 500);
  }
}
