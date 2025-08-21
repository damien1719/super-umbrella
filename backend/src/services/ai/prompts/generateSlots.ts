import { z } from 'zod';
import { openaiProvider } from '../providers/openai.provider';
import { createHash } from 'crypto';

export type SlotSpec = {
  mode: 'user' | 'computed' | 'llm';
  type: 'text' | 'number' | 'list' | 'table';
  pattern?: string;
  deps?: string[];
  prompt?: string;
};

type Notes = Record<string, unknown>;

export function buildPrompt(ids: string[], spec: Record<string, SlotSpec>, notes: Notes, style?: string) {
  const schema: Record<string, string> = {};
  const prompts: Record<string, string> = {};

  ids.forEach((id) => {
    schema[id] = spec[id]?.type || 'text';
    const slotPrompt = (notes as any)?.[`${id}_prompt`] || (spec[id] as any)?.prompt || '';
    if (slotPrompt) prompts[id] = slotPrompt;
  });

  let promptText = `Réponds UNIQUEMENT avec un JSON de la forme :
[
  { "id": "slotId", "value": ... }
]

Liste des ids à remplir : ${ids.join(', ')}

Schéma des types par id (OBLIGATOIRE) : ${JSON.stringify(schema, null, 2)}

Règles STRICTES :
- Si le type est "number" : renvoie un **nombre JSON brut** (sans guillemets), **sans unité**, ni texte autour. Utilise "." pour le séparateur décimal.
- Si la valeur est inconnue pour un "number", renvoie null (pas de string "N/A"). 
- Ne renvoie JAMAIS de listes à puces ni de texte hors du JSON demandé.
`;

  if (Object.keys(prompts).length > 0) {
    promptText += `\nInstructions spécifiques par champ:\n${Object.entries(prompts).map(([id, p]) => `- ${id}: ${p}`).join('\n')}`;
  }
  if (style) promptText += `\n\nStyle à respecter: ${style}`;
  if (Object.keys(notes).length > 0) promptText += `\n\nNotes contextuelles: ${JSON.stringify(notes)}`;

  // Garde les contraintes de style pour les champs rédigés
  promptText += `\n\nContraintes de style (valable pour tous les champs rédigés) :
- Écrire sous forme de phrases complètes.
- Pas de listes à puces.
- Pas de phrases télégraphiques.
- Faire comme dans un compte rendu professionnel.
`;

  return promptText;
}

export function buildZod(ids: string[], spec: Record<string, SlotSpec>) {
/*   const shape: Record<string, z.ZodTypeAny> = {};
  ids.forEach((id) => {
    const t = spec[id]?.type;
    switch (t) {
      case 'number':
        shape[id] = z.number();
        break;
      case 'list':
        shape[id] = z.array(z.any());
        break;
      case 'table':
        shape[id] = z.array(z.any());
        break;
      default:
        shape[id] = z.string();
    }
  });
  return z.object(shape); */

  return z.array(z.object({
    id: z.string(),
    value: z.coerce.string().default('')
  })).transform((arr) => Object.fromEntries(arr.map(x => [x.id, x.value])));

}

const MAX_BATCH = 15;

function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items.slice()];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function extractJsonSnippet(text: string): string | null {
  if (!text) return null;
  const t = String(text);
  // Try code fence first
  const fenceMatch = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    return fenceMatch[1].trim();
  }
  // Then try to find the largest JSON object or array
  const firstBrace = t.indexOf('{');
  const lastBrace = t.lastIndexOf('}');
  const firstBracket = t.indexOf('[');
  const lastBracket = t.lastIndexOf(']');

  const hasObj = firstBrace !== -1 && lastBrace > firstBrace;
  const hasArr = firstBracket !== -1 && lastBracket > firstBracket;

  if (hasArr && (!hasObj || firstBracket < firstBrace)) {
    return t.slice(firstBracket, lastBracket + 1);
  }
  if (hasObj) {
    return t.slice(firstBrace, lastBrace + 1);
  }
  return null;
}

function parseJsonLoose(raw: unknown): unknown {
  if (raw == null) return {};
  const asText = typeof raw === 'string' ? raw : JSON.stringify(raw);
  // 1) Try direct parse
  try {
    return JSON.parse(asText);
  } catch {}
  // 2) Try extracting a JSON snippet (code fence or best-effort braces)
  try {
    const snippet = extractJsonSnippet(asText);
    if (snippet) {
      return JSON.parse(snippet);
    }
  } catch {}
  return {};
}

function normalizeToArray(data: unknown): Array<{ id: string; value: unknown }> {
  if (Array.isArray(data)) {
    // Expect array of { id, value } or raw values; filter/normalize
    return data
      .map((item: any, index) => {
        if (item && typeof item === 'object' && 'id' in item) {
          return { id: String((item as any).id), value: (item as any).value };
        }
        // If it's not an object with id, drop it
        return null;
      })
      .filter((x): x is { id: string; value: unknown } => Boolean(x));
  }
  if (data && typeof data === 'object') {
    // Object map { id: value }
    return Object.entries(data as Record<string, unknown>).map(([k, v]) => ({ id: String(k), value: v }));
  }
  return [];
}

export async function callModel(ids: string[], spec: Record<string, SlotSpec>, notes: Notes, style?: string) {
  if (ids.length === 0) {
    return { slots: {}, promptHash: '' } as { slots: Record<string, unknown>; promptHash: string };
  }

  const idBatches = chunkArray(ids, MAX_BATCH);
  const mergedSlots: Record<string, unknown> = {};
  const promptsForHash: string[] = [];

  for (const batch of idBatches) {
    const prompt = buildPrompt(batch, spec, notes, style);
    promptsForHash.push(prompt);
    const messages = [{ role: 'user', content: prompt }];

    const raw = await openaiProvider.chat({ messages } as unknown as import('openai/resources/index').ChatCompletionCreateParams);
    const parsed = parseJsonLoose(raw);
    const normalized = normalizeToArray(parsed);

    const schema = buildZod(batch, spec);
    const batchSlots = schema.parse(normalized as unknown as object) as Record<string, unknown>;
    Object.assign(mergedSlots, batchSlots);
  }

  const hasher = createHash('sha256');
  for (const p of promptsForHash) {
    hasher.update(p);
  }
  const promptHash = hasher.digest('hex');

  return { slots: mergedSlots, promptHash } as { slots: Record<string, unknown>; promptHash: string };
}

export const _test = { buildPrompt, buildZod };


