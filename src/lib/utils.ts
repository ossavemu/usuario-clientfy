import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(countryCode: string, phone: string): string {
  return `${countryCode}${phone}`.replace(/\+/g, '');
}
