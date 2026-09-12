/** Deja solo dígitos y quita el indicativo +57 si viene incluido. */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('57')) {
    digits = digits.slice(2);
  }
  return digits;
}

/** Celular colombiano: 10 dígitos, empieza en 3. */
export function isValidPhone(digits: string): boolean {
  return /^3\d{9}$/.test(digits);
}

export const PHONE_ERROR_MESSAGE =
  'Ingresa un celular colombiano válido (10 dígitos, empieza en 3).';
