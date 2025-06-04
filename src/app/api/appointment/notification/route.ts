import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { calendlyUserTable } from '@/lib/api/leg-cal';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { userNumber, botNumber, typeOfEvent, name } = await request.json();
  console.log(userNumber, botNumber, typeOfEvent, name);
  if (!userNumber || !botNumber || !typeOfEvent)
    return jsonError(
      'Bot number, user number and type of event are required',
      400,
    );
  const user = calendlyUserTable.find((user) => user.botNumber === botNumber);
  if (!user) return jsonError('User not found', 404);
  const response = await fetch(
    'https://dk5rw3hg-3008.use.devtunnels.ms/' + 'notify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: userNumber,
        typeOfEvent,
        host: botNumber,
        name,
      }),
    },
  );
  if (!response.ok) return jsonError('Failed to notify', 500);
  console.log(await response.text());
  return jsonSuccess({ message: 'Notification sent' });
}
