import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { calendlyUserTable } from '@/lib/api/leg-cal';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const botNumber = request.nextUrl.searchParams.get('botNumber');
    const type = request.nextUrl.searchParams.get('type');

    if (!botNumber) return jsonError('Bot number is required', 400);
    const user = calendlyUserTable.find((user) => user.botNumber === botNumber);
    if (!user) return jsonError('User not found', 404);

    const url =
      type === 'virtual' ? user.calendlyUrlVirtual : user.calendlyUrlInPerson;
    if (!url) return jsonError('URL not found', 404);

    return jsonSuccess({ calendlyUrl: url });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Error', 500);
  }
}
