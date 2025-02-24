import { NextResponse } from 'next/server';

const API_URL = `http://${process.env.ORQUESTA_URL}/api`;
const API_KEY = process.env.SECRET_KEY;

export async function POST(request: Request) {
  try {
    const { email, numberphone, companyName, address, features } =
      await request.json();

    const cleanPhone = numberphone.replace('+', '');

    console.log('🚀 Iniciando creación de instancia');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('📱 Número:', cleanPhone);
    console.log('🏢 Empresa:', companyName);
    console.log('📍 Dirección:', address);
    console.log('⚙️  Configuración:', features);

    const response = await fetch(`${API_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY || '',
      },
      body: JSON.stringify({
        email,
        numberphone: cleanPhone,
        companyName,
        address,
        features: {
          virtualAppointments: features.virtualAppointments || false,
          inPersonAppointments: features.inPersonAppointments || false,
          autoInvite: features.autoInvite || false,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage =
        data.error || `Error del servidor: ${response.status}`;
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.ok ? 400 : response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: { status: 'creating', progress: 0 },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
