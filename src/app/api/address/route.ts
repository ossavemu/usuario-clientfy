import {
  deleteUserAddress,
  getUserAddress,
  saveUserAddress,
} from '@/lib/turso/operations';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// GET - Obtener dirección
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email no proporcionado' },
        { status: 400 },
      );
    }

    const address = await getUserAddress(email);
    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error('Error al obtener la dirección:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener la dirección' },
      { status: 500 },
    );
  }
}

// POST - Guardar dirección
export async function POST(request: NextRequest) {
  try {
    const { email, address } = await request.json();

    if (!email || !address) {
      return NextResponse.json(
        { success: false, error: 'Email y dirección son requeridos' },
        { status: 400 },
      );
    }

    await saveUserAddress(email, address);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al guardar la dirección:', error);
    return NextResponse.json(
      { success: false, error: 'Error al guardar la dirección' },
      { status: 500 },
    );
  }
}

// DELETE - Eliminar dirección
export async function DELETE(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email no proporcionado' },
        { status: 400 },
      );
    }

    await deleteUserAddress(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar la dirección:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar la dirección' },
      { status: 500 },
    );
  }
}

// PUT - Actualizar dirección
export async function PUT(request: NextRequest) {
  try {
    const { email, address } = await request.json();

    if (!email || !address) {
      return NextResponse.json(
        { success: false, error: 'Email y dirección son requeridos' },
        { status: 400 },
      );
    }

    await saveUserAddress(email, address);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar la dirección:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar la dirección' },
      { status: 500 },
    );
  }
}
