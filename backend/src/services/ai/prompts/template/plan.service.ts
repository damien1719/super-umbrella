// src/services/ai/prompts/template/plan.service.ts
// === APPEL 1 : Génération du plan avec répétiteurs ===

import { z } from 'zod';
import { openaiProvider } from '../../providers/openai.provider';
import type { Request, Response } from 'express';
import type { SlotSpec, FieldSpec, RepeatSpec } from '../../../../types/template';

// Modèle utilisé pour l'import magique
const IMPORT_MAGIQUE_MODEL = 'gpt-4.1';

/* =========================
 * TYPES
 * ========================= */

export const SlotDraft = z.object({
  label: z.string().min(1),
  prompt: z.string().min(1),
}).strict();
export type SlotDraft = z.infer<typeof SlotDraft>;

export const RepeaterDraft = z.object({
  name: z.string().min(1),
  items: z.array(z.string().min(1)).min(1), // au moins 1 item
  slots: z.array(SlotDraft).min(1),         // au moins 1 slot par répétiteur
}).strict();
export type RepeaterDraft = z.infer<typeof RepeaterDraft>;

export const PlanDraft = z.object({
  label: z.string().min(1),
  slots: z.array(SlotDraft).default([]),
  repeaters: z.array(RepeaterDraft).default([]),
}).strict();
export type PlanDraft = z.infer<typeof PlanDraft>;


// Résolution : on fabrique des FieldSpec (ids feuilles), et des repeaters prêts à convertir
export type RepeaterResolved = {
  id: string;                                      // id unique du répétiteur (slug + dédup)
  name: string;
  items: Array<{ key: string; label: string }>;    // { key,label } stables
  slots: FieldSpec[];                               // champs LEAF (kind:'field', pas de {{item.key}})
};

export type PlanResolved = {
  label: string;
  slots: FieldSpec[];            // champs top-level (leaf ids)
  repeaters: RepeaterResolved[]; // répétiteurs (avec champs leaf)
};


/* =========================
 * 2) HELPERS (IDs, slug, dédup)
 * ========================= */


// Helper pour convertir PlanResolved vers SlotSpec[] canonique
function planToCanonicalSlotsSpec(plan: PlanResolved): SlotSpec[] {
  const repeats: RepeatSpec[] = plan.repeaters.map((r) => ({
    kind: 'repeat' as const,
    id: r.id,
    from: { enum: r.items },
    ctx: 'item',
    namePattern: r.name,
    slots: r.slots, // FieldSpec[] avec ids FEUILLES
  }));
  return [...plan.slots, ...repeats];
}


const slugify = (s: string) =>
  s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
   .toLowerCase().replace(/[^a-z0-9._\s-]/g, ' ')
   .replace(/[\s_-]+/g, '_').replace(/^_+|_+$/g, '') || 'x';

const ensureUnique = (base: string, seen: Set<string>) => {
  let id = base || 'x', i = 1;
  while (seen.has(id)) id = `${base}_${i++}`;
  seen.add(id); return id;
};

export function resolvePlan(draft: PlanDraft): PlanResolved {
  const seenTop = new Set<string>();

  const slots: FieldSpec[] = draft.slots.map(s => ({
    kind: 'field',
    id: ensureUnique(slugify(s.label), seenTop), // leaf id
    label: s.label,
    type: 'text',
    mode: 'llm',
    prompt: s.prompt,
  }));

  const repeaters = draft.repeaters.map(r => {
    const repId = ensureUnique(slugify(r.name || 'rep'), seenTop);
    const itemSeen = new Set<string>();
    const items = r.items.map(lbl => ({ key: ensureUnique(slugify(lbl), itemSeen), label: lbl }));

    const seenInRep = new Set<string>();
    const repSlots: FieldSpec[] = r.slots.map((s, idx) => ({
      kind: 'field',
      id: ensureUnique(slugify(s.label) || `slot_${idx + 1}`, seenInRep), // leaf id
      label: s.label,
      type: 'text',
      mode: 'llm',
      prompt: s.prompt,
    }));

    return { id: repId, name: r.name, items, slots: repSlots };
  });

  return { label: draft.label, slots, repeaters };
}

/* =========================
 * 3) PROMPTS LLM
 * ========================= */

export const PLAN_SCHEMA = {
  name: 'PlanDraft',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      label: { type: 'string' },
      slots: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            prompt: { type: 'string' }
          },
          required: ['label', 'prompt'],
          additionalProperties: false
        }
      },
      repeaters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            items: {
              type: 'array',
              minItems: 1,
              items: { type: 'string' }
            },
            slots: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  prompt: { type: 'string' }
                },
                required: ['label', 'prompt'],
                additionalProperties: false
              }
            }
          },
          required: ['name', 'items', 'slots'],
          additionalProperties: false
        }
      }
    },
    required: ['label', 'slots', 'repeaters'],
    additionalProperties: false
  }
} as const;

function buildPlanPrompt(textSource: string): string {
  return [
    'Rôle: transforme un texte libre en PLAN DE TEMPLATE.',
    'Objectif: lister les SLOTS variables (avec micro-prompts) et détecter les RÉPÉTITIONS (repeaters).',
    '',
    'Contraintes:',
    '- Retourne UNIQUEMENT un JSON valide',
    '- Pour le prompt impératif, ≤ 25 mots, autonome, sans référence externe.',
    '- Minimalisme: crée un slot uniquement pour ce qui varie réellement.',
    '- Créé un répétiteur pour les parties qui se répètent pour factoriser les prompts communs.',
    '',
    '### Schéma de sortie (JSON Schema):',
    '```json',
    JSON.stringify(PLAN_SCHEMA.schema, null, 2),
    '```',
    '',
    `### Texte source:\n"""${textSource}"""`
  ].join('\n');
}

/* =========================
 * 4) SERVICES
 * ========================= */

async function callLLM_SystemUser(system: string, user: string, responseFormat?: any) {
  const chatParams: any = {
    model: IMPORT_MAGIQUE_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.1,
  };

  if (responseFormat) {
    chatParams.response_format = responseFormat;
  }

  const res = await openaiProvider.chat(chatParams);
  const content = res || '';
  return content.trim();
}

function safeJsonParse<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    throw new Error('Réponse LLM non-JSON ou invalide.');
  }
}

/* =========================
 * 5) CONTROLLERS (Express)
 * ========================= */

// POST /api/importMagique/plan
// body: { source: string }
/* export async function buildPlanController(req: Request, res: Response) {
  const { source } = req.body as { source?: string };
  if (!source || source.trim().length === 0) {
    res.status(400).json({ error: 'Missing "source"' });
    return;
  }

  const system = 'Tu es un assistant qui conçoit des PLANS DE TEMPLATE éditoriaux minimalistes.';
  const user = buildPlanPrompt(source);

  const raw = await callLLM_SystemUser(system, user);
  const draft = safeJsonParse<unknown>(raw);
  const parsed = PlanDraft.parse(draft);

  const plan = resolvePlan(parsed);

  res.json({
    ok: true,
    planDraft: parsed,
    planResolved: plan,
  });
} */


// Fonction utilitaire pour générer un plan depuis du texte
export async function generatePlanFromText(sourceText: string): Promise<PlanResolved> {
  const system = 'Tu es un assistant qui conçoit des PLANS DE TEMPLATE éditoriaux minimalistes.';
  const user = buildPlanPrompt(sourceText);

  const raw = await callLLM_SystemUser(system, user, {
    type: 'json_schema',
    json_schema: {
      name: 'PlanDraft',
      strict: true,
      schema: PLAN_SCHEMA.schema,
    },
  });

  const draft = safeJsonParse<unknown>(raw);
  const parsed = PlanDraft.parse(draft);
  return resolvePlan(parsed);
}

// Nouvelle fonction qui retourne le format canonique à persister
export async function generatePlanWithSlotsSpec(sourceText: string): Promise<{
  planResolved: PlanResolved;
  slotsSpec: SlotSpec[]; // <-- canonique
}> {
  const planResolved = await generatePlanFromText(sourceText);
  const slotsSpec = planToCanonicalSlotsSpec(planResolved);
  return { planResolved, slotsSpec };
}
