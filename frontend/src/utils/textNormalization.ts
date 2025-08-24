/**
 * Normalize text by cleaning up whitespace, line breaks, and formatting
 * @param input - The input text to normalize
 * @returns Normalized text with consistent formatting
 */
export function normalize(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
