import { prisma } from '../../prisma';
import { SectionTemplateService } from '../sectionTemplate.service';
import { callModel } from './prompts/generateSlots';
import { hydrate } from './templates/hydrate';

type Notes = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type SlotSpec = {
  mode: 'user' | 'computed' | 'llm';
  type: 'text' | 'number' | 'list' | 'table';
  pattern?: string;
  deps?: string[];
  prompt?: string;
};

function normalizeSlotsSpec(raw: unknown): Record<string, SlotSpec> {
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown> & { slots?: Array<Record<string, unknown>> };

    if (obj.slots && !Array.isArray(obj.slots)) {
      return obj.slots as Record<string, SlotSpec>;
    }

    if (Array.isArray(obj.slots)) {
      const out: Record<string, SlotSpec> = {};
      for (const s of obj.slots) {
        const id = typeof s.id === 'string' ? s.id : undefined;
        const mode = s.mode as SlotSpec['mode'];
        const type = s.type as SlotSpec['type'];
        if (id && type) {
          const actualMode = mode || 'user';
          out[id] = {
            mode: actualMode,
            type,
            pattern: typeof s.pattern === 'string' ? s.pattern : undefined,
            deps: Array.isArray(s.deps) ? (s.deps as string[]) : undefined,
            prompt: typeof (s as any).prompt === 'string' ? (s as any).prompt : undefined,
          };
        }
      }
      return out;
    }
  }
  return (raw as Record<string, SlotSpec>) || {};
}

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

export async function generateFromTemplate(
  sectionTemplateId: string,
  contentNotes: Notes,
  opts: { instanceId: string; userSlots?: Record<string, unknown>; stylePrompt?: string; model?: string },
) {
  const template = await SectionTemplateService.get(sectionTemplateId);
  if (!template) throw new Error('Template not found');
  const ast = template.content;
  const slotsSpec = normalizeSlotsSpec(template.slotsSpec);
  const parts = partitionSlots(slotsSpec);

  const computed = computeComputed(parts.computed, slotsSpec, contentNotes);
  const llm = await callModel(parts.llm, slotsSpec, contentNotes, opts.stylePrompt);

  const slots = { ...(opts.userSlots || {}), ...computed, ...llm.slots };

  const hydratedState = hydrate(ast, slots, slotsSpec);
  const editorState = {
    root: (hydratedState as any)?.root || hydratedState,
    version: 1,
  };
  const assembledState = JSON.stringify(editorState);

  await db.bilanSectionInstance.update({
    where: { id: opts.instanceId },
    data: {
      generatedContent: { slots, assembledState },
      templateIdUsed: sectionTemplateId,
      templateVersionUsed: template.version,
      generatedContentUpdatedAt: new Date(),
    },
  });
  return { slots, assembledState };
}

export async function regenerateSlots(instanceId: string, slotIds: string[]) {
  const instance = await db.bilanSectionInstance.findUnique({ where: { id: instanceId } });
  if (!instance?.templateIdUsed) throw new Error('Template missing');
  const template = await SectionTemplateService.get(instance.templateIdUsed);
  if (!template) throw new Error('Template not found');
  const slotsSpec = normalizeSlotsSpec(template.slotsSpec);
  const parts = partitionSlots(slotsSpec);
  const computedIds = slotIds.filter((id) => parts.computed.includes(id));
  const llmIds = slotIds.filter((id) => parts.llm.includes(id));
  const computed = computeComputed(computedIds, slotsSpec, instance.contentNotes as Notes);
  const llm = await callModel(llmIds, slotsSpec, instance.contentNotes as Notes, undefined);
  const existing = (instance.generatedContent as Record<string, unknown>)?.slots || {};
  const slots = { ...existing, ...computed, ...llm.slots };
  const hydratedState = hydrate(template.content, slots, slotsSpec);

  const editorState = {
    root: (hydratedState as any)?.root || hydratedState,
    version: 1,
  };
  const assembledState = JSON.stringify(editorState);

  await db.bilanSectionInstance.update({
    where: { id: instanceId },
    data: {
      generatedContent: { ...(instance.generatedContent as Record<string, unknown>), slots, assembledState },
      generatedContentUpdatedAt: new Date(),
    },
  });
  return { slots, assembledState };
}

export const _test = { partitionSlots, computeComputed };


