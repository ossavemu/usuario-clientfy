/**
 * Función utilitaria para manejo de errores en estilo Go
 * Maneja automáticamente tanto casos síncronos como asíncronos
 *
 * @param fn - Función o promesa a ejecutar
 * @returns - Tupla [error, resultado] donde solo uno tendrá valor
 *
 * @example
 * // Uso asíncrono:
 * const [error, data] = await try$(fetchData());
 * const [error, data] = await try$(() => asyncFunction());
 *
 * // Uso síncrono:
 * const [error, result] = try$(() => syncFunction());
 */
export function try$<T>(
  fn: Promise<T> | (() => T | Promise<T>)
): Promise<[Error | null, T | null]> | [Error | null, T | null] {
  try {
    // Caso 1: Si es una función
    if (typeof fn === 'function') {
      try {
        const result = fn();

        // Si el resultado es una promesa, manejarlo asincrónicamente
        if (result instanceof Promise) {
          return result
            .then((value): [null, T] => [null, value])
            .catch((err): [Error, null] => [
              err instanceof Error ? err : new Error(String(err)),
              null,
            ]);
        }

        // Si no es una promesa, retornar resultado síncrono
        return [null, result];
      } catch (error) {
        return [
          error instanceof Error ? error : new Error(String(error)),
          null,
        ];
      }
    }

    // Caso 2: Si ya es una promesa
    return fn
      .then((value): [null, T] => [null, value])
      .catch((err): [Error, null] => [
        err instanceof Error ? err : new Error(String(err)),
        null,
      ]);
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
}

export default try$;
