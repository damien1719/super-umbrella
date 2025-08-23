import { z } from 'zod';
import { openaiProvider } from '../providers/openai.provider';
import { createHash } from 'crypto';

import type { SlotSpec } from '../../../types/template';

type Notes = Record<string, unknown>;

function isFieldSpec(spec: SlotSpec): spec is import('../../../types/template').FieldSpec {
  return spec.kind === 'field';
}

export function buildPrompt(ids: string[], spec: Record<string, SlotSpec>, notes: Notes, style?: string) {
  const schema: Record<string, string> = {};
  const prompts: Record<string, string> = {};

  ids.forEach((id) => {
    const slotSpec = spec[id];
    schema[id] = (slotSpec && isFieldSpec(slotSpec)) ? slotSpec.type : 'text';
    const slotPrompt = (notes as any)?.[`${id}_prompt`] || (slotSpec && isFieldSpec(slotSpec) ? slotSpec.prompt : '') || '';
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
    const slotSpec = spec[id];
    const t = (slotSpec && isFieldSpec(slotSpec)) ? slotSpec.type : 'text';
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
  // Extract imageBase64 from notes if present
  const { _imageBase64, ...cleanNotes } = notes as Notes & { _imageBase64?: string };
  const imageBase64 = _imageBase64;
  console.log('[DEBUG] callModel - STARTED', {
    idsCount: ids.length,
    ids: ids,
    hasNotes: !!notes,
    notesKeys: Object.keys(notes || {}),
    hasStyle: !!style,
    styleLength: style?.length || 0,
  });

  if (ids.length === 0) {
    console.log('[DEBUG] callModel - No IDs to process, returning empty result');
    return { slots: {}, promptHash: '' } as { slots: Record<string, unknown>; promptHash: string };
  }

  const idBatches = chunkArray(ids, MAX_BATCH);
  const mergedSlots: Record<string, unknown> = {};
  const promptsForHash: string[] = [];

  console.log('[DEBUG] callModel - Processing in batches:', {
    totalIds: ids.length,
    batchCount: idBatches.length,
    maxBatchSize: MAX_BATCH,
    batches: idBatches.map(batch => ({ size: batch.length, ids: batch })),
  });

  for (let batchIndex = 0; batchIndex < idBatches.length; batchIndex++) {
    const batch = idBatches[batchIndex];
    console.log(`[DEBUG] callModel - Processing batch ${batchIndex + 1}/${idBatches.length}:`, {
      batchSize: batch.length,
      batchIds: batch,
    });

    const prompt = buildPrompt(batch, spec, cleanNotes, style);
    console.log(`[DEBUG] callModel - Batch ${batchIndex + 1} prompt built:`, {
      promptLength: prompt.length,
      promptPreview: prompt.slice(0, 300) + '...',
    });

    promptsForHash.push(prompt);

    // Create multimodal message if image is present
    const messages = imageBase64
      ? [{
          role: 'user' as const,
          content: [
            {
              type: 'image_url' as const,
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
              },
            },
            {
              type: 'text' as const,
              text: prompt,
            },
          ],
        }]
      : [{ role: 'user' as const, content: prompt }];

    console.log(`[DEBUG] callModel - Batch ${batchIndex + 1} calling OpenAI...`);
    const raw = await openaiProvider.chat({ messages } as unknown as import('openai/resources/index').ChatCompletionCreateParams);

    console.log(`[DEBUG] callModel - Batch ${batchIndex + 1} LLM response received:`, {
      rawType: typeof raw,
      rawLength: typeof raw === 'string' ? raw.length : 'N/A',
      rawPreview: typeof raw === 'string' ? raw.slice(0, 500) + '...' : JSON.stringify(raw).slice(0, 500) + '...',
    });

    const parsed = parseJsonLoose(raw);
    console.log(`[DEBUG] callModel - Batch ${batchIndex + 1} parsed JSON:`, {
      parsedType: typeof parsed,
      parsedKeys: typeof parsed === 'object' ? Object.keys(parsed || {}) : 'N/A',
      parsedPreview: JSON.stringify(parsed).slice(0, 300) + '...',
    });

    const normalized = normalizeToArray(parsed);
    console.log(`[DEBUG] callModel - Batch ${batchIndex + 1} normalized data:`, {
      normalizedLength: normalized.length,
      normalizedItems: normalized.map(item => ({ id: item.id, valueType: typeof item.value, valuePreview: String(item.value).slice(0, 100) })),
    });

    const schema = buildZod(batch, spec);
    console.log(`[DEBUG] callModel - Batch ${batchIndex + 1} applying Zod schema...`);

    try {
      const batchSlots = schema.parse(normalized as unknown as object) as Record<string, unknown>;
      console.log(`[DEBUG] callModel - Batch ${batchIndex + 1} Zod validation successful:`, {
        batchSlotsKeys: Object.keys(batchSlots),
        batchSlotsCount: Object.keys(batchSlots).length,
        batchSlotsPreview: Object.entries(batchSlots).slice(0, 3),
      });

      Object.assign(mergedSlots, batchSlots);
      console.log(`[DEBUG] callModel - Batch ${batchIndex + 1} merged into final slots, current total:`, {
        mergedSlotsCount: Object.keys(mergedSlots).length,
        mergedSlotsKeys: Object.keys(mergedSlots),
      });
    } catch (error) {
      console.error(`[DEBUG] callModel - Batch ${batchIndex + 1} Zod validation ERROR:`, error);
      console.error(`[DEBUG] callModel - Batch ${batchIndex + 1} Zod error details:`, {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  console.log('[DEBUG] callModel - All batches processed, finalizing...');
  const hasher = createHash('sha256');
  for (const p of promptsForHash) {
    hasher.update(p);
  }
  const promptHash = hasher.digest('hex');

  console.log('[DEBUG] callModel - COMPLETED successfully:', {
    finalSlotsCount: Object.keys(mergedSlots).length,
    finalSlotsKeys: Object.keys(mergedSlots),
    promptHash: promptHash,
    finalSlotsPreview: Object.entries(mergedSlots).slice(0, 5),
  });

  return { slots: mergedSlots, promptHash } as { slots: Record<string, unknown>; promptHash: string };
}

export const _test = { buildPrompt, buildZod };


