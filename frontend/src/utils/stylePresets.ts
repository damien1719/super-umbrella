import { apiFetch } from '@/utils/api';
import type { TitleFormatSpec } from '@/types/question';

export type CreateStylePresetBody = {
  target: 'TITLE' | 'SUBTITLE' | 'PARAGRAPH';
  style: unknown;
  visibility?: 'PUBLIC' | 'PRIVATE';
};

export async function createOrGetStylePreset(body: CreateStylePresetBody) {
  return apiFetch<{ created: boolean; preset: unknown }>(
    '/api/v1/style-presets',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

// Optional helper to generate a readable name from a format
export function formatToPresetName(format: TitleFormatSpec): string {
  const parts: string[] = [];
  if (format.kind === 'heading') parts.push(`H${format.level ?? 2}`);
  const size =
    typeof format.fontSize === 'number'
      ? `${format.fontSize}pt`
      : format.fontSize;
  if (size) parts.push(size);
  if (format.align && format.align !== 'left') parts.push(format.align);
  if (format.bold) parts.push('bold');
  if (format.italic) parts.push('italic');
  if (format.underline) parts.push('underline');
  if (format.case && format.case !== 'none') parts.push(format.case);
  if (!parts.length) return 'Titre personnalisé';
  return parts.join(' ');
}
