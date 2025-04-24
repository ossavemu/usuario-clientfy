import { saveUserPhone as saveTursoPhone } from '@/lib/turso/operations';
import type { PhoneData } from '@/types/user';

export async function saveUserPhone(email: string, phoneData: PhoneData) {
  try {
    const cleanPhone = `${phoneData.countryCode.replace(
      '+',
      '',
    )}${phoneData.phone.replace(/\D/g, '')}`;
    return await saveTursoPhone(
      email,
      cleanPhone,
      phoneData.countryCode,
      phoneData.serviceType,
    );
  } catch (error) {
    console.error('Error al guardar teléfono en la base de datos:', error);
    throw error;
  }
}
