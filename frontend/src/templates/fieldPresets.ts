import type { FieldSpec, FieldPresetKey } from '../types/template';

export const FIELD_PRESETS: Record<
  FieldPresetKey,
  { label: string; defaults: Omit<FieldSpec, 'id' | 'kind' | 'label'> }
> = {
  desc_facts: {
    label: 'Description factuelle',
    defaults: {
      mode: 'llm',
      type: 'text',
      prompt:
        "Rédige une description factuelle, brève et neutre, sans interprétation. Phrases courtes. Pas de métaphore, pas d’adjectifs subjectifs.",
      defaultValue: '',
      optional: false,
      template: undefined,
      pattern: undefined,
      deps: [],
      preset: {
        key: 'desc_facts',
        version: 1,
        locked: [], // on autorise à changer type/mode si tu veux
      },
    },
  },

  score: {
    label: 'Score',
    defaults: {
      mode: 'user', // saisie manuelle par défaut (simple et robuste)
      type: 'number',
      prompt: '',
      defaultValue: null,
      optional: false,
      template: undefined,
      pattern: undefined,
      deps: [],
      preset: {
        key: 'score',
        version: 1,
        locked: ['type', 'mode'], // un score reste un nombre saisi par l’utilisateur
      },
    },
  },

  conclusion: {
    label: 'Conclusion',
    defaults: {
      mode: 'llm',
      type: 'text',
      prompt:
        "Rédige une conclusion synthétique, factuelle et orientée recommandations. 4–6 lignes. Évite le jargon, pas d’affirmations diagnostiques.",
      defaultValue: '',
      optional: false,
      template: undefined,
      pattern: undefined,
      deps: [],
      preset: {
        key: 'conclusion',
        version: 1,
        locked: [], // libre
      },
    },
  },
};

export function makeFieldFromPreset(
  key: FieldPresetKey,
  opts?: { id?: string; label?: string; overrides?: Partial<Omit<FieldSpec, 'id' | 'kind' | 'preset'>> }
): FieldSpec {
  const base = FIELD_PRESETS[key];
  const id = opts?.id ?? `field-${Date.now()}`;
  const label = opts?.label ?? base.label;

  return {
    kind: 'field',
    id,
    label,
    ...base.defaults,
    ...(opts?.overrides ?? {}),
    // IMPORTANT: garder la trace du preset même si overrides
    preset: {
      ...base.defaults.preset!,
      detached: false,
    },
  };
}

export function isLockedByPreset(field: FieldSpec, prop: FieldSpec['type'] extends never ? never : keyof FieldSpec): boolean {
  if (!field.preset || field.preset.detached) return false;
  return (field.preset.locked ?? []).includes(prop as any);
}
