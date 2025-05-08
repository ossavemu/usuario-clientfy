'use server';

import { saveSession } from '@/dal/logged';
import { saveUser, validateServicePassword } from '@/dal/unlogged';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { ARGON2_MEMORY_COST, ENCRYPT_ALGORITHM } from '@/lib/constants/encrypt';
import { setUserCookie, signUser } from '@/lib/session/user';
import { type RegistrationData } from '@/types/registration';

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
      return jsonError('Todos los campos son requeridos', 400);
    }

    // Validar contraseña personal
    if (
      data.password.user.length < 8 ||
      !/[a-zA-Z]/.test(data.password.user) ||
      !/\d/.test(data.password.user)
    ) {
      return jsonError(
        'La contraseña personal no cumple con los requisitos',
        400,
      );
    }

    // Validar contraseña de servicio con Turso
    const isValidServicePassword = await validateServicePassword(
      data.email,
      data.password.service,
    );

    if (!isValidServicePassword) {
      return jsonError('La contraseña de servicio no es válida', 401);
    }

    // Buscar si el usuario ya existe
    try {
      // Guardar usuario con la estructura completa
      const hashedPassword = await Bun.password.hash(data.password.user, {
        algorithm: ENCRYPT_ALGORITHM,
        memoryCost: ARGON2_MEMORY_COST,
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
        return jsonError('Error al guardar el usuario', 500);
      }

      // Generar token JWT
      const token = signUser(data.email);

      // Guardar sesión
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      await saveSession(data.email, token, expiresAt);

      // Devolver usuario (sin contraseña)
      const userResponse = {
        ...userToSave,
        password: undefined,
      };

      // Establecer cookie de sesión
      const response = jsonSuccess({ token, user: userResponse });
      await setUserCookie(response, token);
      return response;
    } catch (error) {
      if ((error as Error).message.includes('UNIQUE constraint failed')) {
        return jsonError('El usuario ya existe', 400);
      }
      throw error; // Re-lanzar para ser capturado por el catch externo
    }
  } catch (error) {
    console.error('Error en registro:', error);
    return jsonError('Error al registrar usuario', 500);
  }
}
