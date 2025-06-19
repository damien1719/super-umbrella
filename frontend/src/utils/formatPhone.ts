export function formatPhone(value: string): string {
  console.log('value', value);
  const digits = value.replace(/\D/g, '');
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}
