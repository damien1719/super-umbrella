import { prisma } from '../prisma';
import { SectionTemplateService } from './sectionTemplate.service';
import { openaiProvider } from './ai/providers/openai.provider';
import { z } from 'zod';
import { jsonrepair } from 'jsonrepair';

type Notes = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type SlotSpec = {
  mode: 'user' | 'computed' | 'llm';
  type: 'text' | 'number' | 'list' | 'table';
  pattern?: string;
  deps?: string[];
};

function partitionSlots(spec: Record<string, SlotSpec>) {
  const res = { user: [] as string[], computed: [] as string[], llm: [] as string[] };
  for (const [id, s] of Object.entries(spec || {})) {
    res[s.mode].push(id);
  }
  return res;
}

function computeComputed(ids: string[], spec: Record<string, SlotSpec>, notes: Notes) {
  const out: Record<string, unknown> = {};
  for (const id of ids) {
    const s = spec[id];
    if (!s) continue;
    let val = s.pattern || '';
    for (const dep of s.deps || []) {
      const rep = notes?.[dep] ?? '';
      val = val.replace(new RegExp(`{${dep}}`, 'g'), String(rep));
    }
    out[id] = val;
  }
  return out;
}

function buildPrompt(ids: string[], spec: Record<string, SlotSpec>, notes: Notes, style?: string) {
  const schema: Record<string, string> = {};
  ids.forEach((id) => { schema[id] = spec[id]?.type || 'text'; });
  return `Remplis les champs JSON suivant ${JSON.stringify(schema)} en respectant le style ${style || ''}. Notes: ${JSON.stringify(notes)}`;
}

function buildZod(ids: string[], spec: Record<string, SlotSpec>) {
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

function hydrate(ast: unknown, slots: Record<string, unknown>, spec: Record<string, SlotSpec>): unknown {
  if (Array.isArray(ast)) return ast.map((n) => hydrate(n, slots, spec));
  if (ast && typeof ast === 'object') {
    const node = ast as { type?: string; id?: string; children?: unknown };
    if (node.type === 'slot' && typeof node.id === 'string') {
      const val = slots[node.id];
      const s = spec[node.id];
      if (s?.type === 'list') {
        return { type: 'list', items: Array.isArray(val) ? val : [] };
      }
      if (s?.type === 'table') {
        return { type: 'table', rows: Array.isArray(val) ? val : [] };
      }
      return { type: 'text', value: val ?? '' };
    }
    return { ...node, ...(node.children ? { children: hydrate(node.children, slots, spec) } : {}) };
  }
  return ast;
}

async function generateLLM(ids: string[], spec: Record<string, SlotSpec>, notes: Notes, style?: string) {
  if (ids.length === 0) return { slots: {}, promptHash: '' };
  const prompt = buildPrompt(ids, spec, notes, style);
  const messages = [{ role: 'user', content: prompt }];
  const raw = await openaiProvider.chat({ messages } as unknown as import('openai/resources/index').ChatCompletionCreateParams);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw as string);
  } catch {
    parsed = JSON.parse(jsonrepair(raw as string));
  }
  const schema = buildZod(ids, spec);
  const slots = schema.parse(parsed as object);
  return { slots, promptHash: String(prompt.length) };
}

export async function generateFromTemplate(
  sectionTemplateId: string,
  contentNotes: Notes,
  opts: { instanceId: string; userSlots?: Record<string, unknown>; stylePrompt?: string; model?: string },
) {
  const template = await SectionTemplateService.get(sectionTemplateId);
  if (!template) throw new Error('Template not found');
  const ast = template.content;
  const slotsSpec = template.slotsSpec as Record<string, SlotSpec>;
  const parts = partitionSlots(slotsSpec);
  const computed = computeComputed(parts.computed, slotsSpec, contentNotes);
  const llm = await generateLLM(parts.llm, slotsSpec, contentNotes, opts.stylePrompt);
  const slots = { ...(opts.userSlots || {}), ...computed, ...llm.slots };
  const assembledState = hydrate(ast, slots, slotsSpec);
  await db.bilanSectionInstance.update({
    where: { id: opts.instanceId },
    data: {
      generatedContent: { slots, assembledState },
      templateIdUsed: sectionTemplateId,
      templateVersionUsed: template.version,
      promptHash: llm.promptHash,
      model: opts.model || 'openai',
      lastGeneratedAt: new Date(),
    },
  });
  return { slots, assembledState };
}

export async function regenerateSlots(instanceId: string, slotIds: string[]) {
  const instance = await db.bilanSectionInstance.findUnique({ where: { id: instanceId } });
  if (!instance?.templateIdUsed) throw new Error('Template missing');
  const template = await SectionTemplateService.get(instance.templateIdUsed);
  if (!template) throw new Error('Template not found');
  const slotsSpec = template.slotsSpec as Record<string, SlotSpec>;
  const parts = partitionSlots(slotsSpec);
  const computedIds = slotIds.filter((id) => parts.computed.includes(id));
  const llmIds = slotIds.filter((id) => parts.llm.includes(id));
  const computed = computeComputed(computedIds, slotsSpec, instance.contentNotes as Notes);
  const llm = await generateLLM(llmIds, slotsSpec, instance.contentNotes as Notes, undefined);
  const existing = (instance.generatedContent as Record<string, unknown>)?.slots || {};
  const slots = { ...existing, ...computed, ...llm.slots };
  const assembledState = hydrate(template.content, slots, slotsSpec);
  await db.bilanSectionInstance.update({
    where: { id: instanceId },
    data: {
      generatedContent: { ...(instance.generatedContent as Record<string, unknown>), slots, assembledState },
      lastGeneratedAt: new Date(),
    },
  });
  return { slots, assembledState };
}

export const _test = { partitionSlots, computeComputed, buildPrompt, buildZod, hydrate };
