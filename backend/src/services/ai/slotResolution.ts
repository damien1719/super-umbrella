import type { FieldSpec } from '../../types/template';
import type { Notes } from './genPartPlaceholder';

function getByPath(source: unknown, rawPath?: string): unknown {
  if (!source || typeof source !== 'object' || !rawPath) return undefined;
  const segments = rawPath.split('.').filter(Boolean);
  if (segments.length === 0) return undefined;

  let current: unknown = source;
  for (const segment of segments) {
    if (current == null) return undefined;

    if (Array.isArray(current)) {
      const idx = Number(segment);
      if (Number.isInteger(idx) && idx >= 0 && idx < current.length) {
        current = current[idx];
        continue;
      }
      return undefined;
    }

    if (
      typeof current === 'object' &&
      Object.prototype.hasOwnProperty.call(current, segment)
    ) {
      current = (current as Record<string, unknown>)[segment];
      continue;
    }

    return undefined;
  }

  return current;
}

export function resolveUserSlots(
  ids: string[],
  spec: Record<string, FieldSpec>,
  notes: Notes,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!ids.length) return out;

  const notesMap =
    notes && typeof notes === 'object' ? (notes as Record<string, unknown>) : {};

  for (const id of ids) {
    const field = spec[id];
    if (!field) continue;

    const byPath = field.answerPath
      ? getByPath(notesMap, field.answerPath)
      : getByPath(notesMap, id);
    if (byPath !== undefined) {
      out[id] = byPath;
      continue;
    }

    if (field.answerPath && field.answerPath in notesMap) {
      out[id] = notesMap[field.answerPath];
      continue;
    }

    if (id in notesMap) {
      out[id] = notesMap[id];
    }
  }

  return out;
}

export const _internal = { getByPath };
