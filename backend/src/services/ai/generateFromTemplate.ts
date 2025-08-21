import { prisma } from '../../prisma';
import { SectionTemplateService } from '../sectionTemplate.service';
import { callModel } from './prompts/generateSlots';
import { hydrate } from './templates/hydrate';

type Notes = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// Expanded field spec used by the generator/hydrator
export type FieldSpec = {
  id: string;
  label?: string;
  mode: 'user' | 'computed' | 'llm';
  type: 'text' | 'number' | 'list' | 'table';
  pattern?: string;
  deps?: string[];
  prompt?: string;
  template?: string;
};

export type GroupSpec = {
  kind: 'group';
  id: string;
  label?: string;
  slots: SlotSpec[];
};

export type RepeatSpec = {
  kind: 'repeat';
  id: string;
  from: { enum: Array<{ key: string; label: string }>} | { path: string };
  ctx?: string;
  namePattern?: string; // "${group}.${item.key}.${slotId}"
  slots: Array<Omit<FieldSpec, 'id' | 'deps' | 'prompt'> & { id: string; deps?: string[]; prompt?: string }>;
};

export type UseKitSpec = {
  kind: 'use';
  kit: string;
  as?: string;
  with?: Record<string, unknown>;
};

export type SlotSpec = FieldSpec | GroupSpec | RepeatSpec | UseKitSpec;

function getAtPath(obj: unknown, path: string): unknown {
  if (!path) return undefined;
  const parts = path.split('.');
  let cur: any = obj as any;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function ensureArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val == null) return [] as T[];
  return [val as T];
}

function simpleTpl(input: string, ctx: Record<string, unknown>): string {
  return String(input || '').replace(/\{\{\s*([\w\.]+)\s*\}\}/g, (_, path) => {
    const v = getAtPath(ctx, path);
    return v == null ? '' : String(v);
  });
}

function expandSlotsSpec(raw: unknown, notes: Notes): Record<string, FieldSpec> {
  // Back-compat: allow object map { id: spec }
  if (raw && typeof raw === 'object' && !Array.isArray((raw as any).slots)) {
    const obj = (raw as Record<string, unknown>) as Record<string, FieldSpec>;
    // Filter to fields only if an object map is provided
    const out: Record<string, FieldSpec> = {};
    for (const [id, s] of Object.entries(obj)) {
      if ((s as any).type) out[id] = { ...(s as any), id } as FieldSpec;
    }
    return out;
  }

  const list = (raw && typeof raw === 'object' && Array.isArray((raw as any).slots)) ? (raw as any).slots as SlotSpec[] : (Array.isArray(raw) ? (raw as SlotSpec[]) : []);

  const fields: Record<string, FieldSpec> = {};

  function pushField(field: FieldSpec) {
    if (!field.id) return;
    fields[field.id] = { ...field };
  }

  function expand(node: SlotSpec, ctx: { groupId?: string; item?: { key: string; label: string } }) {
    if ((node as any).kind === 'group') {
      const group = node as GroupSpec;
      for (const child of group.slots || []) expand(child, { groupId: group.id, item: ctx.item });
      return;
    }
    if ((node as any).kind === 'repeat') {
      const rep = node as RepeatSpec;
      const items: Array<{ key: string; label: string }> = 'enum' in rep.from
        ? ensureArray(rep.from.enum)
        : ensureArray(getAtPath({ notes }, (rep.from as any).path)) as Array<{ key: string; label: string }>;

      const ctxName = rep.ctx || 'item';

      for (const it of items) {
        for (const child of rep.slots) {
          // Build id using namePattern or child id with moustache
          const slotIdBase = simpleTpl(child.id, { [ctxName]: it, group: ctx.groupId, item: it });
          const slotId = rep.namePattern
            ? simpleTpl(rep.namePattern, { group: ctx.groupId ?? '', item: it, slotId: slotIdBase })
            : slotIdBase;

          const deps = ensureArray<string>(child.deps).map((d) => simpleTpl(d as string, { [ctxName]: it, item: it }));
          const prompt = child.prompt ? simpleTpl(child.prompt, { [ctxName]: it, item: it }) : undefined;

          pushField({
            id: slotId,
            label: child.label,
            mode: child.mode,
            type: child.type,
            pattern: child.pattern,
            deps: deps.length > 0 ? deps : undefined,
            prompt,
            template: child.template,
          });
        }
      }
      return;
    }
    if ((node as any).kind === 'use') {
      // Not implemented: fallback to no-op to keep compatibility
      return;
    }

    // Field
    const f = node as FieldSpec;
    pushField({ ...f });
  }

  for (const n of list) expand(n, {});
  return fields;
}

function partitionSlots(spec: Record<string, FieldSpec>) {
  const res = { user: [] as string[], computed: [] as string[], llm: [] as string[] };
  for (const [id, s] of Object.entries(spec || {})) {
    res[s.mode].push(id);
  }
  return res;
}

function computeComputed(ids: string[], spec: Record<string, FieldSpec>, notes: Notes) {
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
  const slotsSpec = expandSlotsSpec(template.slotsSpec, contentNotes);
  const parts = partitionSlots(slotsSpec);

  const computed = computeComputed(parts.computed, slotsSpec, contentNotes);
  const llm = await callModel(parts.llm, slotsSpec, contentNotes, opts.stylePrompt);

  const slots = { ...(opts.userSlots || {}), ...computed, ...llm.slots };

  // DEBUG mapping for templated ids: log unmatched ids
  const allIds = Object.keys(slotsSpec);
  const provided = Object.keys(slots);
  const missing = allIds.filter((id) => slots[id] === undefined);
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('[generateFromTemplate] Missing slot values for:', missing.slice(0, 20));
  }

  const hydratedState = hydrate(ast, slots, slotsSpec);

  function toArray<T>(val: unknown): T[] {
    if (Array.isArray(val)) return val as T[];
    if (val == null) return [] as T[];
    return [val as T];
  }

  function ensureTextDefaults(node: any): any {
    if (node?.type === 'text') {
      return {
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        version: 1,
        ...node,
      };
    }
    return node;
  }

  function ensureParagraphDefaults(node: any): any {
    if (node?.type === 'paragraph') {
      return {
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: toArray<any>(node.children).map(ensureTextDefaults),
        ...node,
      };
    }
    return node;
  }

  function normalizeChildren(children: any): any[] {
    return toArray<any>(children).map((c) => ensureParagraphDefaults(ensureTextDefaults(c)));
  }

  function buildLexicalRoot(input: any) {
    const maybeRoot = input?.root ?? input;
    const children = normalizeChildren(maybeRoot?.children ?? maybeRoot);
    return {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children,
    };
  }

  const editorState = {
    root: buildLexicalRoot(hydratedState),
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
  const slotsSpec = expandSlotsSpec(template.slotsSpec, instance.contentNotes as Notes);
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


