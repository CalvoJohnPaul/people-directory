/**
 * @example
 * ```ts
 * isValidMobileNumber('+639190000000') // true
 * isValidMobileNumber('639190000000') // true
 * isValidMobileNumber('09190000000') // true
 * isValidMobileNumber('9190000000') // true
 * ```
 */
export function isValidMobileNumber(value: string): boolean {
  return /^(?:\+63|63|0)?9\d{9}$/.test(value);
}

/**
 * @example
 * ```ts
 * normalizeMobileNumber('+639190000000') // '+639190000000'
 * normalizeMobileNumber('639190000000') // '+639190000000'
 * normalizeMobileNumber('09190000000') // '+639190000000'
 * normalizeMobileNumber('9190000000') // '+639190000000'
 * ```
 */
export function normalizeMobileNumber(value: string) {
  const match = value.match(/^(?:\+63|63|0)?(9\d{9})$/);
  if (!match) return value;
  return `+63${match[1]}`;
}

/**
 * @example
 * ```ts
 * formatMobileNumber('+639190000000') // '+63 919 0000 000'
 * formatMobileNumber('639190000000') // '+63 919 0000 000'
 * formatMobileNumber('09190000000') // '+63 919 0000 000'
 * formatMobileNumber('9190000000') // '+63 919 0000 000'
 * ```
 */
export function formatMobileNumber(value: string): string {
  const match = value.match(/^(?:\+63)?(9\d{2})(\d{4})(\d{3})$/);
  if (!match) return value;
  return `+63 ${match[1]} ${match[2]} ${match[3]}`;
}
