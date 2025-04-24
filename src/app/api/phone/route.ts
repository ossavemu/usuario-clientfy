import { deleteUserPhone } from '@/lib/user/deletePhone';
import { getUserPhone } from '@/lib/user/getPhone';
import { saveUserPhone } from '@/lib/user/savePhone';
import { updateUserPhone } from '@/lib/user/updatePhone';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, phoneData } = await request.json();

    const existingPhone = await getUserPhone(email);
    if (existingPhone) {
      return NextResponse.json(
        { error: 'Ya tienes un número registrado' },
        { status: 400 },
      );
    }

    await saveUserPhone(email, phoneData);
    return NextResponse.json({ success: true, phone: phoneData });
  } catch (error) {
    console.error('Error en POST /api/phone:', error);
    return NextResponse.json(
      { error: 'Error al guardar el teléfono' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { email, phoneData } = await request.json();
    await updateUserPhone(email, phoneData);
    return NextResponse.json({ success: true, phone: phoneData });
  } catch (error) {
    console.error('Error en PUT /api/phone:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el teléfono' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 },
      );
    }

    await deleteUserPhone(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/phone:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el teléfono' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 },
      );
    }

    const phone = await getUserPhone(email);
    return NextResponse.json({ success: true, phone });
  } catch (error) {
    console.error('Error en GET /api/phone:', error);
    return NextResponse.json(
      { error: 'Error al obtener el teléfono' },
      { status: 500 },
    );
  }
}
