import { saveUser as saveTursoUser } from '@/lib/turso/operations';
import { saveSession } from '@/lib/turso/session';
import { type RegistrationData } from '@/types/registration';
import jwt from 'jsonwebtoken';

export async function saveUser(data: RegistrationData) {
  try {
    // Crear token JWT
    const token = jwt.sign(
      { email: data.email },
      process.env.JWT_SECRET_KEY || '',
      {
        expiresIn: '1h',
      },
    );

    // Guardar usuario en Turso
    await saveTursoUser({
      email: data.email,
      name: data.name,
      company_name: data.companyName,
      password:
        typeof data.password === 'string'
          ? data.password
          : JSON.stringify(data.password),
      phone: data.phone,
      country_code: data.countryCode,
      service_type: data.serviceType,
      images: data.images,
      training_files: data.trainingFiles,
      prompt: data.prompt,
      assistant_name: data.assistantName,
    });

    // Guardar sesión con el token
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hora
    await saveSession(data.email, token, expiresAt);

    return token;
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    throw new Error('Error al guardar el usuario en la base de datos');
  }
}
