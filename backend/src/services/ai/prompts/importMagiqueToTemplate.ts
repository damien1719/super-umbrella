// src/features/importMagique/index.ts
import { z } from 'zod';
import { openaiProvider } from '../providers/openai.provider'; // <- ton provider existant
import type { Request, Response, NextFunction } from 'express';

// Modèle utilisé pour l'import magique (GPT-4.1 pour de meilleures performances)
const IMPORT_MAGIQUE_MODEL = 'gpt-4.1-mini';

/* =========================
 * 1) SCHEMAS & TYPES
 * ========================= */

// ----- Appel 1: Draft sans ids/types/modes -----
const SlotDraft = z.object({
  label: z.string().min(1),
  optional: z.boolean().optional().default(false),
  prompt: z.string().min(1),
}).strict();
type SlotDraft = z.infer<typeof SlotDraft>;

const RepeaterDraft = z.object({
  name: z.string().min(1),              // ex: "Catégories"
  items: z.array(z.string().min(1)),    // ex: ["animaux","fruit","meuble"]
  slots: z.array(SlotDraft).default([]) // slots à répéter par item
}).strict();
type RepeaterDraft = z.infer<typeof RepeaterDraft>;

const PlanDraft = z.object({
  label: z.string().min(1),
  // slots "simples" (hors répétiteurs)
  slots: z.array(SlotDraft).default([]),
  // répétiteurs
  repeaters: z.array(RepeaterDraft).default([]),
}).strict();
type PlanDraft = z.infer<typeof PlanDraft>;

// ----- Appel 1: Résolution backend (ids + defaults) -----
export type SlotSpec = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'list' | 'table';
  mode: 'llm' | 'user' | 'computed';
  optional: boolean;
  prompt?: string; // on copie prompt ici pour stockage
};

export type RepeaterSpec = {
  id: string;      // généré par le backend
  name: string;    // label humain du répétiteur
  items: Array<{ key: string; label: string }>;
  slots: SlotSpec[]; // slots template avec {{item.key}} utilisables dans id si besoin
};

export type PlanResolved = {
  label: string;
  slots: SlotSpec[];
  repeaters: RepeaterSpec[];
};

// ----- Appel 2: Sortie finale -----
export type LexicalSlotNode = {
  type: 'slot';
  slotId: string;
  slotLabel: string;
  slotType: 'text' | 'number' | 'list' | 'table';
  optional: boolean;
  placeholder: string;
  version?: 1;
};

export type RepeatSpecNode = {
  type: 'repeat';
  id: string;
  from: { enum: Array<{ key: string; label: string }> };
  ctx: 'item';
  slots: Array<LexicalSlotNode>;
};

export type LexicalAST = {
  root: {
    type: 'root';
    children: Array<
      | { type: 'text'; value: string }
      | LexicalSlotNode
      | RepeatSpecNode
      | { type: 'list'; children: Array<LexicalSlotNode | { type: 'text'; value: string }> }
      | { type: 'paragraph'; children: Array<LexicalSlotNode | { type: 'text'; value: string }> }
    >;
  };
};

export type TemplatePayload = {
  ast: LexicalAST;
  slots: SlotSpec[]; // inventaire plat des slots (copié depuis PlanResolved)
  label: string;
};

/* =========================
 * 2) HELPERS (IDs, slug, dédup)
 * ========================= */

function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // accents
    .toLowerCase()
    .replace(/[^a-z0-9._\s-]/g, ' ')
    .replace(/[\s_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function ensureUniqueId(base: string, seen: Set<string>): string {
  let id = base || 'field';
  let i = 1;
  while (seen.has(id)) {
    id = `${base}_${i++}`;
  }
  seen.add(id);
  return id;
}

// Ajoute ids + defaults à partir d’un PlanDraft
function resolvePlan(draft: PlanDraft): PlanResolved {
  const seen = new Set<string>();

  // 1) slots simples
  const slots: SlotSpec[] = draft.slots.map((s) => {
    const base = slugify(s.label);
    const id = ensureUniqueId(base, seen);
    return {
      id,
      label: s.label,
      type: 'text',          // par défaut (tu peux affiner plus tard côté UI)
      mode: 'llm',           // par défaut
      optional: s.optional ?? false,
      prompt: s.prompt, // on stocke le prompt ici
    };
  });

  // 2) repeaters
  const repeaters: RepeaterSpec[] = draft.repeaters.map((r) => {
    const repBase = slugify(r.name || 'repeater');
    const repId = ensureUniqueId(repBase, seen);

    const items = r.items.map((it) => {
      const key = ensureUniqueId(`${repId}.${slugify(it)}`, seen); // clé stable, namespaced
      return { key, label: it };
    });

    // slots du répétiteur : on génère un id "modèle" sans {{item}} ici,
    // mais on ajoute un suffixe ".{{item.key}}" pour indiquer la future expansion
    const repSlots: SlotSpec[] = r.slots.map((s) => {
      const base = `${repId}.${slugify(s.label)}`;
      const withItem = `${base}.{{item.key}}`;
      const id = ensureUniqueId(withItem, seen);
      return {
        id,
        label: s.label,
        type: 'text',
        mode: 'llm',
        optional: s.optional ?? false,
        prompt: s.prompt,
      };
    });

    return { id: repId, name: r.name, items, slots: repSlots };
  });

  return {
    label: draft.label,
    slots,
    repeaters,
  };
}

/* =========================
 * 3) PROMPTS LLM
 * ========================= */

// 1) Définis un schema JSON (compatible avec response_format.json_schema)
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


// --- Appel 1: construit un "plan" SANS ids/types/modes ---
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


// --- Appel 2: produit l’AST Lexical minimal à partir du plan résolu ---
function buildAstPrompt(plan: PlanResolved): string {
  // On transmet le plan résolu (avec ids stables) au modèle
  // et on lui demande de construire un AST minimal + slots plat.
  // NB: le modèle doit réutiliser EXACTEMENT ces slotId.
  const planJson = JSON.stringify(plan, null, 2);
  return [
    'Rôle: Tu construis un AST Lexical minimal à partir d’un plan résolu.',
    'Sortie attendue: { "ast": { "root": ... }, "slots": SlotSpec[], "label": string }',
    'Règles:',
    '- Insère des nœuds { type:"slot", slotId, slotLabel, slotType, optional, placeholder } en reprenant EXACTEMENT les ids du plan.',
    '- Respecte les répétiteurs en créant un nœud { type:"repeat", id, from:{enum}, ctx:"item"}, avec des slots enfants.',
    '- Minimalisme: pas d’ornements inutiles. Utilise du texte fixe seulement si nécessaire pour structurer.',
    '- "slots" = inventaire plat (copie du plan), et si "prompt" présent, copie-le tel quel.',
    '- Retourne UNIQUEMENT un JSON valide.',
    '',
    'Plan résolu:',
    planJson,
  ].join('\n');
}

/* =========================
 * 4) SERVICES
 * ========================= */

async function callLLM_SystemUser(system: string, user: string, responseFormat?: any) {
  // Utilise ton provider habituel (à adapter si besoin)
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

// POST /importMagique/plan
// body: { source: string }
export async function buildPlanController(req: Request, res: Response) {
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
    planDraft: parsed, // sans ids/types/modes
    planResolved: plan, // avec ids stables + defaults + prompts
  });
}

// POST /importMagique/toTemplate
// body: { planResolved: PlanResolved }
// (optionnel: tu peux aussi accepter planDraft + re-run resolvePlan ici)
export async function planToTemplateController(req: Request, res: Response, _next: NextFunction) {
  const { planResolved } = req.body as { planResolved?: PlanResolved };
  if (!planResolved || !planResolved.label) {
    res.status(400).json({ error: 'Missing "planResolved"' });
    return;
  }

  const system = 'Tu es un assistant qui construit des AST Lexical minimalistes, corrects et cohérents.';
  const user = buildAstPrompt(planResolved);

  const raw = await callLLM_SystemUser(system, user);
  const tpl = safeJsonParse<TemplatePayload>(raw);

  // Règle de prudence: on remplace l’inventaire slots par la vérité serveur (ids/type/mode)
  // pour éviter des divergences si le LLM a modifié quoi que ce soit.
  const payload: TemplatePayload = {
    ast: tpl.ast,
    slots: planResolved.slots.concat(
      planResolved.repeaters.flatMap((r) => r.slots)
    ),
    label: planResolved.label,
  };

  res.json({ ok: true, template: payload });
}

// Fonction principale pour l'import magique - combine les deux étapes
export async function importMagiqueToTemplate({
  sourceText,
}: { sourceText: string }): Promise<{
  ast: unknown;
  slots: SlotSpec[];
  label?: string;
}> {
  console.log('[DEBUG] importMagiqueToTemplate - Starting LLM processing');
  console.log('[DEBUG] importMagiqueToTemplate - Input text length:', sourceText.length);
  console.log('[DEBUG] importMagiqueToTemplate - Input text preview:', sourceText.substring(0, 100) + '...');

  try {
    // Étape 1: Construire le plan
    console.log('[DEBUG] importMagiqueToTemplate - Building plan...');
    const system1 = 'Tu es un assistant qui conçoit des PLANS DE TEMPLATE éditoriaux minimalistes.';
    const user1 = buildPlanPrompt(sourceText);
    const raw1 = await callLLM_SystemUser(system1, user1, {
      type: 'json_schema',
      json_schema: {
        name: 'PlanDraft',
        strict: true,
        schema: PLAN_SCHEMA.schema,
      },
    });
    const draft = safeJsonParse<unknown>(raw1);
    const parsed = PlanDraft.parse(draft);
    const plan = resolvePlan(parsed);
    console.log('[DEBUG] importMagiqueToTemplate - Plan built with', plan.slots.length, 'slots and', plan.repeaters.length, 'repeaters');

    // Étape 2: Construire l'AST
    console.log('[DEBUG] importMagiqueToTemplate - Building AST...');
    const system2 = 'Tu es un assistant qui construit des AST Lexical minimalistes, corrects et cohérents.';
    const user2 = buildAstPrompt(plan);
    const raw2 = await callLLM_SystemUser(system2, user2);
    const tpl = safeJsonParse<TemplatePayload>(raw2);

    // Retourner le résultat final
    const result = {
      ast: tpl.ast,
      slots: plan.slots.concat(plan.repeaters.flatMap((r) => r.slots)),
      label: plan.label,
    };

    console.log('[DEBUG] importMagiqueToTemplate - Final result - ast valid:', !!result.ast);
    console.log('[DEBUG] importMagiqueToTemplate - Final result - slots count:', result.slots.length);
    console.log('[DEBUG] importMagiqueToTemplate - Final result - label:', result.label);

    return result;
  } catch (error) {
    console.error('[DEBUG] importMagiqueToTemplate - Error:', error);
    throw error;
  }
}
