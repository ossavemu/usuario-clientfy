import {
  deleteUserAddress,
  getUserAddress,
  saveUserAddress,
} from '@/dal/unlogged';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { requireParam } from '@/lib/api/requireParam';
import type { NextRequest } from 'next/server';

// GET - Obtener dirección
export async function GET(request: NextRequest) {
  try {
    const email = requireParam(
      { email: request.nextUrl.searchParams.get('email') },
      'email',
    );
    const address = await getUserAddress(email);
    return jsonSuccess({ success: true, address });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Error al obtener la dirección',
      500,
    );
  }
}

// POST - Guardar dirección
export async function POST(request: NextRequest) {
  try {
    const { email, address } = await request.json();
    if (!email || !address) throw new Error('Email y dirección son requeridos');
    await saveUserAddress(email, address);
    return jsonSuccess({ success: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Error al guardar la dirección',
      500,
    );
  }
}

// DELETE - Eliminar dirección
export async function DELETE(request: NextRequest) {
  try {
    const email = requireParam(
      { email: request.nextUrl.searchParams.get('email') },
      'email',
    );
    await deleteUserAddress(email);
    return jsonSuccess({ success: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Error al eliminar la dirección',
      500,
    );
  }
}

// PUT - Actualizar dirección
export async function PUT(request: NextRequest) {
  try {
    const { email, address } = await request.json();
    if (!email || !address) throw new Error('Email y dirección son requeridos');
    await saveUserAddress(email, address);
    return jsonSuccess({ success: true });
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : 'Error al actualizar la dirección',
      500,
    );
  }
}
