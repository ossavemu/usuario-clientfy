import type { PhoneData } from '@/types/user';
import { saveUserPhone } from './savePhone';

export async function updateUserPhone(email: string, phoneData: PhoneData) {
  return await saveUserPhone(email, phoneData);
}
