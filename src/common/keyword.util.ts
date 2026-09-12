/** Quita espacios sobrantes y pasa a minúsculas para comparar sin importar mayúsculas. */
export function normalizeKeyword(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Palabra clave: entre 4 y 40 caracteres. */
export function isValidKeyword(value: string): boolean {
  return value.length >= 4 && value.length <= 40;
}

export const KEYWORD_ERROR_MESSAGE =
  'Ingresa una palabra clave de al menos 4 caracteres.';
