'use server';

import { ENCRYPT_ALGORITHM, SALT_ROUNDS } from '@/lib/constants/encrypt';
import { saveUser } from '@/lib/turso/operations';
import { validateServicePassword } from '@/lib/turso/servicePassword';
import { saveSession } from '@/lib/turso/session';
import { type RegistrationData } from '@/types/registration';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.SECRET_KEY || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const data: RegistrationData & {
      password: { service: string; user: string };
    } = await request.json();

    // Validar datos requeridos
    if (
      !data.name ||
      !data.companyName ||
      !data.email ||
      !data.password?.service ||
      !data.password?.user
    ) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 },
      );
    }

    // Validar contraseña personal
    if (
      data.password.user.length < 8 ||
      !/[a-zA-Z]/.test(data.password.user) ||
      !/\d/.test(data.password.user)
    ) {
      return NextResponse.json(
        { error: 'La contraseña personal no cumple con los requisitos' },
        { status: 400 },
      );
    }

    // Validar contraseña de servicio con Turso
    const isValidServicePassword = await validateServicePassword(
      data.email,
      data.password.service,
    );

    if (!isValidServicePassword) {
      return NextResponse.json(
        { error: 'La contraseña de servicio no es válida' },
        { status: 401 },
      );
    }

    // Buscar si el usuario ya existe
    try {
      // Guardar usuario con la estructura completa
      const hashedPassword = await Bun.password.hash(data.password.user, {
        algorithm: ENCRYPT_ALGORITHM,
        cost: SALT_ROUNDS,
      });

      // Crear objeto usuario
      const userToSave = {
        email: data.email,
        name: data.name,
        company_name: data.companyName,
        password: hashedPassword,
        phone: data.phone || '',
        country_code: data.countryCode || '',
        service_type: data.serviceType || 'whatsapp',
        images: data.images || [],
        training_files: data.trainingFiles || [],
        prompt: data.prompt || '',
        assistant_name: data.assistantName || '',
      };

      // Guardar usuario en Turso
      const saved = await saveUser(userToSave);

      if (!saved) {
        return NextResponse.json(
          { error: 'Error al guardar el usuario' },
          { status: 500 },
        );
      }

      // Generar token JWT
      const token = jwt.sign({ email: data.email }, JWT_SECRET, {
        expiresIn: '24h',
      });

      // Guardar sesión
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      await saveSession(data.email, token, expiresAt);

      // Devolver usuario (sin contraseña)
      const userResponse = {
        ...userToSave,
        password: undefined,
      };

      return NextResponse.json({ token, user: userResponse });
    } catch (error) {
      if ((error as Error).message.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          { error: 'El usuario ya existe' },
          { status: 400 },
        );
      }
      throw error; // Re-lanzar para ser capturado por el catch externo
    }
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 },
    );
  }
}
