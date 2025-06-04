import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import type { NextRequest } from 'next/server';

interface CalendlyUser {
  botNumber: string;
  calendlyUrlVirtual?: string;
  calendlyUrlInPerson?: string;
  botIP: string;
}

export const calendlyUserTable: CalendlyUser[] = [
  {
    botNumber: '573146858510',
    calendlyUrlVirtual: 'https://calendly.com/osanvem/test',
    calendlyUrlInPerson: 'https://calendly.com/osanvem/new-meeting',
    botIP: '45.230.33.109',
  },
  {
    botNumber: '573042370304',
    calendlyUrlVirtual:
      'https://calendly.com/jmgorange/franquicias-cleanwork-orange',
    calendlyUrlInPerson: undefined,
    botIP: '137.184.40.121',
  },
];

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
