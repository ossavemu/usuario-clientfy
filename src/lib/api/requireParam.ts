export function requireParam<T extends object>(obj: T, key: keyof T): string {
  const value = obj[key];
  if (!value || typeof value !== 'string') {
    throw new Error(`Falta el parámetro requerido: ${String(key)}`);
  }
  return value;
}
