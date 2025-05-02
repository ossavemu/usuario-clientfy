import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { requireParam } from '@/lib/api/requireParam';
import { getDropletPublicIp } from '@/lib/do/getPublicIp';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dropletName = requireParam(
      { dropletName: searchParams.get('dropletName') },
      'dropletName',
    );
    const ip = await getDropletPublicIp(dropletName);
    return jsonSuccess({ success: true, ip });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Error al obtener la IP',
      500,
      { details: error },
    );
  }
}
