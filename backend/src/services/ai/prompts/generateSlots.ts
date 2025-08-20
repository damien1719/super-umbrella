import { z } from 'zod';
import { openaiProvider } from '../providers/openai.provider';

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
    if (slotPrompt) {
      prompts[id] = slotPrompt;
    }
  });

  let promptText = `Remplis les champs JSON suivant ${JSON.stringify(schema)}`;

  if (Object.keys(prompts).length > 0) {
    promptText += `\n\nInstructions spécifiques par champ:\n${Object.entries(prompts).map(([id, p]) => `- ${id}: ${p}`).join('\n')}`;
  }

  if (style) {
    promptText += `\n\nStyle à respecter: ${style}`;
  }

  if (Object.keys(notes).length > 0) {
    promptText += `\n\nNotes contextuelles: ${JSON.stringify(notes)}`;
  }

  return promptText;
}

export function buildZod(ids: string[], spec: Record<string, SlotSpec>) {
  const shape: Record<string, z.ZodTypeAny> = {};
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
  return z.object(shape);
}

export async function callModel(ids: string[], spec: Record<string, SlotSpec>, notes: Notes, style?: string) {
  if (ids.length === 0) {
    return { slots: {}, promptHash: '' } as { slots: Record<string, unknown>; promptHash: string };
  }

  const prompt = buildPrompt(ids, spec, notes, style);
  const messages = [{ role: 'user', content: prompt }];

  console.log('prompt', prompt);

  const raw = await openaiProvider.chat({ messages } as unknown as import('openai/resources/index').ChatCompletionCreateParams);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw as string);
  } catch {
    try {
      const text = String(raw || '');
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      parsed = start >= 0 && end > start ? JSON.parse(text.slice(start, end + 1)) : {};
    } catch {
      parsed = {};
    }
  }
  const schema = buildZod(ids, spec);
  const slots = schema.parse(parsed as object);
  return { slots, promptHash: String(prompt.length) } as { slots: Record<string, unknown>; promptHash: string };
}

export const _test = { buildPrompt, buildZod };


