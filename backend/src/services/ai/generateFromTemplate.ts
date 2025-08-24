import type { FieldSpec, GroupSpec, RepeatSpec, UseKitSpec, SlotSpec } from '../../types/template';

import { prisma } from '../../prisma';
import { SectionTemplateService } from '../sectionTemplate.service';
import { callModel } from './prompts/generateSlots';
import { hydrate } from './templates/hydrate';

type Notes = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

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

type Item = { key: string; label: string };

function expandSlotsSpec(slots: SlotSpec[]): Record<string, FieldSpec> {
  const out: Record<string, FieldSpec> = {};

  const push = (f: FieldSpec, trace: string) => {
    if (!f.id) throw new Error(`Missing field id at ${trace}`);
    if (out[f.id]) throw new Error(`Duplicate field id "${f.id}" at ${trace}`);
    out[f.id] = f;
  };

  const visit = (
    node: SlotSpec,
    ctx: { groupPath: string[]; repeatParts: string[] },
    trace: string,
  ) => {
    switch (node.kind) {
      case 'field': {
        // ID par défaut = <groups>.<repeats...>.<fieldId>
        const segments: string[] = [];
        if (ctx.groupPath.length) segments.push(ctx.groupPath.join('.'));
        if (ctx.repeatParts.length) segments.push(ctx.repeatParts.join('.'));
        segments.push(node.id);

        const finalId = segments.filter(Boolean).join('.');

        const baseLabel = node.label ?? node.id;
        const finalLabel = [...ctx.repeatLabels, baseLabel].join(' · ');

        const field: FieldSpec = {
          kind: 'field',
          id: finalId,
          type: node.type,
          mode: node.mode,
          label: finalLabel,
          pattern: node.pattern,
          deps: node.deps,     // laissé tel quel (pas de templating)
          prompt: node.prompt, // laissé tel quel
          template: node.template,
          optional: node.optional,
        };
        push(field, trace);
        return;
      }

      case 'group': {
        const gctx = {
          groupPath: [...ctx.groupPath, node.id],
          repeatParts: ctx.repeatParts,
        };
        node.slots.forEach((child, i) =>
          visit(child, gctx, `${trace}/group(${node.id})#${i}`),
        );
        return;
      }

      case 'repeat': {
        const items: Item[] = node.from.enum ?? [];
        items.forEach((it, idx) => {
          if (!it || typeof it.key !== 'string' || typeof it.label !== 'string') {
            throw new Error(`Invalid repeat item at ${trace}.enum[${idx}]`);
          }
          const rctx = {
            groupPath: ctx.groupPath,
            // Par défaut: on ajoute "<repeatId>.<item.key>" dans le chemin
            repeatParts: [...ctx.repeatParts, node.id, it.key],
            repeatLabels: [...ctx.repeatLabels, it.label], 
          };
          node.slots.forEach((child, j) =>
            visit(child, rctx, `${trace}/repeat(${node.id})[${it.key}]#${j}`),
          );
        });
        return;
      }

      case 'use': {
        throw new Error(`'use' not implemented (kit="${node.kit}") at ${trace}`);
      }

      default: {
        const _never: never = node;
        throw new Error(`Unknown slot kind at ${trace}`);
      }
    }
  };

  const rootCtx = { groupPath: [], repeatParts: [] as string[], repeatLabels: [] as string[] };
  slots.forEach((n, i) => visit(n, rootCtx, `root#${i}`));
  return out;
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
  opts: { instanceId: string; userSlots?: Record<string, unknown>; stylePrompt?: string; model?: string; imageBase64?: string },
) {

  const template = await SectionTemplateService.get(sectionTemplateId);
  if (!template) {
    throw new Error('Template not found');
  }

  const ast = template.content;
  
  const slotsSpec = expandSlotsSpec(template.slotsSpec);


  const parts = partitionSlots(slotsSpec);

  
  const computed = computeComputed(parts.computed, slotsSpec, contentNotes);

  
  // Add imageBase64 to contentNotes if present
  const enrichedContentNotes = opts.imageBase64
    ? { ...contentNotes, _imageBase64: opts.imageBase64 }
    : contentNotes;

  
  const llm = await callModel(parts.llm, slotsSpec, enrichedContentNotes, opts.stylePrompt);

  console.log('[DEBUG] generateFromTemplate - LLM response received:');
  console.log('[DEBUG] generateFromTemplate - LLM slots generated:', Object.keys(llm.slots || {}));
  console.log('[DEBUG] generateFromTemplate - LLM slots count:', Object.keys(llm.slots || {}).length);
  console.log('[DEBUG] generateFromTemplate - LLM slots content preview:', JSON.stringify(llm.slots, null, 2).slice(0, 1000));
  console.log('[DEBUG] generateFromTemplate - LLM full response object:', JSON.stringify(llm, null, 2));

  const slots = { ...(opts.userSlots || {}), ...computed, ...(llm.slots as Record<string, string | number | null | undefined>) };

  // DEBUG mapping for templated ids: log unmatched ids
  const allIds = Object.keys(slotsSpec);
  const provided = Object.keys(slots);
  const missing = allIds.filter((id) => slots[id] === undefined);
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('[generateFromTemplate] Missing slot values for:', missing.slice(0, 20));
  }

  console.log('[DEBUG] generateFromTemplate - About to hydrate AST:');
  console.log('[DEBUG] generateFromTemplate - AST input:', JSON.stringify(ast).slice(0, 200));
  console.log('[DEBUG] generateFromTemplate - Slots for hydration:', Object.keys(slots));
  console.log('[DEBUG] generateFromTemplate - First few slot values:', Object.entries(slots).slice(0, 3));

  const hydratedState = hydrate(ast, slots as Record<string, string | number | null | undefined>, slotsSpec);

  console.log('[DEBUG] generateFromTemplate - Hydrated state type:', typeof hydratedState);
  console.log('[DEBUG] generateFromTemplate - Hydrated state keys:', Object.keys(hydratedState || {}));
  console.log('[DEBUG] generateFromTemplate - Hydrated state preview:', JSON.stringify(hydratedState).slice(0, 500) + '...');
  console.log('[DEBUG] generateFromTemplate - Hydrated state full length:', JSON.stringify(hydratedState).length);

  function toArray<T>(val: unknown): T[] {
    if (Array.isArray(val)) return val as T[];
    if (val == null) return [] as T[];
    return [val as T];
  }
  
  function ensureTextDefaults(node: any): any {
    if (node?.type !== 'text') return node;
    return {
      ...node,
      detail: node.detail ?? 0,
      format: node.format ?? 0,
      style: node.style ?? '',
      version: node.version ?? 1,
      // mode: node.mode ?? 'normal', // seulement si ta version le requiert
    };
  }
  
  function ensureParagraphDefaults(node: any): any {
    if (node?.type !== 'paragraph') return node;
    return {
      ...node,
      direction: node.direction ?? 'ltr',
      format: node.format ?? '',
      indent: node.indent ?? 0,
      version: node.version ?? 1,
      children: toArray<any>(node.children).map(ensureTextDefaults),
    };
  }
  
  function wrapInParagraph(child: any): any {
    if (child?.type === 'paragraph') return ensureParagraphDefaults(child);
    if (child?.type === 'text') {
      return ensureParagraphDefaults({
        type: 'paragraph',
        children: [ensureTextDefaults(child)],
      });
    }
    return child;
  }
  
  function normalizeChildren(children: any): any[] {
    return toArray<any>(children).map((c) => wrapInParagraph(ensureTextDefaults(c)));
  }
  
  function buildLexicalRoot(input: any) {
    const maybeRoot = input?.root ?? input;
    const children = normalizeChildren(maybeRoot?.children ?? maybeRoot);
    return {
      type: 'root',
      direction: maybeRoot?.direction ?? 'ltr',
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
  

  console.log('[DEBUG] generateFromTemplate - About to return result:', {
    hasSlots: !!slots,
    slotsKeys: Object.keys(slots || {}),
    hasAssembledState: !!assembledState,
    assembledStateLength: assembledState?.length || 0,
    assembledStatePreview: assembledState?.slice(0, 300),
    instanceId: opts.instanceId,
    assembledStateType: typeof assembledState,
    assembledStateKeys: typeof assembledState === 'object' ? Object.keys(assembledState || {}) : 'N/A',
  });

  console.log('[DEBUG] generateFromTemplate - About to update database with:', {
    instanceId: opts.instanceId,
    hasGeneratedContent: true,
    templateIdUsed: sectionTemplateId,
    templateVersionUsed: template.version,
    generatedContentSlotsKeys: Object.keys(slots || {}),
    generatedContentAssembledStateLength: assembledState?.length || 0,
  });

  await db.bilanSectionInstance.update({
    where: { id: opts.instanceId },
    data: {
      generatedContent: { slots, assembledState },
      templateIdUsed: sectionTemplateId,
      templateVersionUsed: template.version,
      generatedContentUpdatedAt: new Date(),
    },
  });

  console.log('[DEBUG] generateFromTemplate - Database updated successfully, returning result');
  console.log('[DEBUG] generateFromTemplate - Final return object:', {
    slotsKeys: Object.keys(slots || {}),
    assembledStateLength: assembledState?.length || 0,
    assembledStatePreview: assembledState?.slice(0, 1000),
  });
  return { slots, assembledState };
}

export async function regenerateSlots(instanceId: string, slotIds: string[]) {
  const instance = await db.bilanSectionInstance.findUnique({ where: { id: instanceId } });
  if (!instance?.templateIdUsed) throw new Error('Template missing');
  const template = await SectionTemplateService.get(instance.templateIdUsed);
  if (!template) throw new Error('Template not found');
  const slotsSpec = expandSlotsSpec(template.slotsSpec);
  const parts = partitionSlots(slotsSpec);
  const computedIds = slotIds.filter((id) => parts.computed.includes(id));
  const llmIds = slotIds.filter((id) => parts.llm.includes(id));
  const computed = computeComputed(computedIds, slotsSpec, instance.contentNotes as Notes);

  console.log('[DEBUG] regenerateSlots - About to call LLM with:');
  console.log('[DEBUG] regenerateSlots - LLM slots to regenerate:', llmIds);
  console.log('[DEBUG] regenerateSlots - LLM slotsSpec preview:', JSON.stringify(slotsSpec, null, 2));
  console.log('[DEBUG] regenerateSlots - LLM contentNotes preview:', JSON.stringify(instance.contentNotes, null, 2));

  const llm = await callModel(llmIds, slotsSpec, instance.contentNotes as Notes, undefined);

  console.log('[DEBUG] regenerateSlots - LLM response received:');
  console.log('[DEBUG] regenerateSlots - LLM slots regenerated:', Object.keys(llm.slots || {}));
  console.log('[DEBUG] regenerateSlots - LLM slots content:', JSON.stringify(llm.slots, null, 2));
  const existing = (instance.generatedContent as Record<string, unknown>)?.slots || {};
  const slots = { ...existing, ...computed, ...(llm.slots as Record<string, string | number | null | undefined>) };
  const hydratedState = hydrate(template.content, slots as Record<string, string | number | null | undefined>, slotsSpec);

  const editorState = {
    root: (hydratedState as any)?.root || hydratedState,
    version: 1,
  };
  const assembledState = JSON.stringify(editorState);

  console.log('[DEBUG] regenerateSlots - About to update database with regenerated content');
  console.log('[DEBUG] regenerateSlots - Editor state created:', {
    hasRoot: !!editorState.root,
    version: editorState.version,
    assembledStateLength: assembledState.length,
    assembledStatePreview: assembledState.slice(0, 200),
  });

  await db.bilanSectionInstance.update({
    where: { id: instanceId },
    data: {
      generatedContent: { ...(instance.generatedContent as Record<string, unknown>), slots, assembledState },
      generatedContentUpdatedAt: new Date(),
    },
  });

  console.log('[DEBUG] regenerateSlots - Database updated successfully');
  console.log('[DEBUG] regenerateSlots - Returning result:', {
    slotsKeys: Object.keys(slots || {}),
    assembledStateLength: assembledState.length,
  });
  return { slots, assembledState };
}

export const _test = { partitionSlots, computeComputed };


