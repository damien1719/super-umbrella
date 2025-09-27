import type { FieldSpec, SlotSpec } from '../../types/template';

import { prisma } from '../../prisma';
import { SectionTemplateService } from '../sectionTemplate.service';
import { callModel } from './prompts/generateSlots';
import { hydrate } from './templates/hydrate';
import {
  lexicalStateToJSON,
  normalizeLexicalEditorState,
} from '../../utils/lexicalEditorState';
import { applyGenPartPlaceholders, type Notes } from './genPartPlaceholder';
import { LexicalAssembler } from '../bilan/lexicalAssembler';
import { AnchorService, type AnchorSpecification } from './anchor.service';
import { getInstanceContext } from './instanceContext.service';
import { resolveUserSlots } from './slotResolution';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;


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
    ctx: { groupPath: string[]; repeatParts: string[]; repeatLabels: string[] },
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
          answerPath: node.answerPath,
        };
        push(field, trace);
        return;
      }

      case 'group': {
        const gctx = {
          groupPath: [...ctx.groupPath, node.id],
          repeatParts: ctx.repeatParts,
          repeatLabels: ctx.repeatLabels,
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
        throw new Error(`Unknown slot kind at ${trace}`);
      }
    }
  };

  const rootCtx = { groupPath: [], repeatParts: [] as string[], repeatLabels: [] as string[] };
  slots.forEach((n, i) => visit(n, rootCtx, `root#${i}`));
  return out;
}


function partitionSlots(spec: Record<string, FieldSpec>) {
  console.log("partition - spec", spec);
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
  opts: { instanceId: string; userSlots?: Record<string, unknown>; stylePrompt?: string; model?: string; imageBase64?: string; contextMd?: string; placeholdersUseContextFallback?: boolean },
) {

  const template = await SectionTemplateService.get(sectionTemplateId);
  if (!template) {
    throw new Error('Template not found');
  }

  console.log("contentNotes - GENRETATE FREO TEMPLATE", contentNotes);

  const ast = await applyGenPartPlaceholders({
    instanceId: opts.instanceId,
    contentNotes,
    templateContent: template.content,
    genPartsSpec: template.genPartsSpec,
    templateStylePrompt: template.stylePrompt,
    stylePrompt: opts.stylePrompt,
    imageBase64: opts.imageBase64,
    // For gen-part placeholders we want to use RAW notes only when requested.
    // Default behavior keeps current fallback to contextMd to preserve retro-compat.
    contextMd: opts.placeholdersUseContextFallback === false ? undefined : opts.contextMd,
  });
  
  const slotsSpec = expandSlotsSpec(template.slotsSpec);


  const parts = partitionSlots(slotsSpec);

  console.log("user", parts.user);

  const user = resolveUserSlots(parts.user, slotsSpec, contentNotes);

  console.log("user", user);

  
  const computed = computeComputed(parts.computed, slotsSpec, contentNotes);

  // Choose LLM context: prefer plain markdown provided by caller; otherwise raw notes
  const llmContext = (typeof opts.contextMd === 'string' && opts.contextMd.length > 0)
    ? opts.contextMd
    : contentNotes;

  const llm = await callModel(parts.llm, slotsSpec, llmContext as unknown as Record<string, unknown> | string, opts.stylePrompt, undefined, opts.imageBase64);

  console.log('[DEBUG] generateFromTemplate - LLM response received:');

  const slots = { ...user, ...(opts.userSlots || {}), ...computed, ...(llm.slots as Record<string, string | number | null | undefined>) };

  // DEBUG mapping for templated ids: log unmatched ids
  const allIds = Object.keys(slotsSpec);
  const missing = allIds.filter((id) => slots[id] === undefined);
  if (missing.length > 0) {
    console.warn('[generateFromTemplate] Missing slot values for:', missing.slice(0, 20));
  }

  const hydratedState = hydrate(ast, slots as Record<string, string | number | null | undefined>, slotsSpec);


  const editorState = normalizeLexicalEditorState(hydratedState);

  // Try anchor assembly: if template contains anchors (explicit anchor-node or inline markers),
  // replace them with rendered tables based on instance questions/answers.
  const anchorAssembledState = await anchorAssemble(editorState, opts.instanceId, contentNotes);
  const assembledState = anchorAssembledState ?? lexicalStateToJSON(editorState);
  
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
  const slotsSpec = expandSlotsSpec(template.slotsSpec);
  const parts = partitionSlots(slotsSpec);
  const computedIds = slotIds.filter((id) => parts.computed.includes(id));
  const llmIds = slotIds.filter((id) => parts.llm.includes(id));
  const computed = computeComputed(computedIds, slotsSpec, instance.contentNotes as Notes);
  const user = resolveUserSlots(parts.user, slotsSpec, instance.contentNotes as Notes);


  const llm = await callModel(llmIds, slotsSpec, instance.contentNotes as Notes, undefined);

  const existing = (instance.generatedContent as Record<string, unknown>)?.slots || {};
  const slots = {
    ...existing,
    ...user,
    ...computed,
    ...(llm.slots as Record<string, string | number | null | undefined>),
  };
  const hydratedState = hydrate(template.content, slots as Record<string, string | number | null | undefined>, slotsSpec);

  const editorState = normalizeLexicalEditorState(hydratedState);
  const anchorAssembledState2 = await anchorAssemble(editorState, instanceId, instance.contentNotes as Notes);
  const assembledState = anchorAssembledState2 ?? lexicalStateToJSON(editorState);


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

// --- Anchor assembly helpers ---

type LexicalNode = Record<string, unknown> & {
  type?: string;
  tag?: string;
  text?: string;
  anchorId?: string;
  children?: unknown;
};

type LexicalState = { root?: { children?: unknown } };

async function anchorAssemble(
  editorState: ReturnType<typeof normalizeLexicalEditorState>,
  instanceId: string,
  answers: Record<string, unknown>,
): Promise<string | null> {
  try {
    const root = (editorState?.root ?? {}) as LexicalNode;
    const children = Array.isArray((root as any).children)
      ? ((root as any).children as unknown[])
      : [];

    // Fast check: does the tree contain an anchor-node or inline marker?
    const hasAnchorsInTree = containsAnchors(children);
    if (!hasAnchorsInTree) {
      return null;
    }

    // Load section context (cached) to resolve anchors and AST snippets
    const instanceCtx = await getInstanceContext(instanceId);
    const questions = instanceCtx.sectionQuestions;
    const astSnippets = instanceCtx.astSnippets ?? undefined;

    const anchors: AnchorSpecification[] = AnchorService.collect(questions);
    if (anchors.length === 0) {
      return null;
    }

    // Convert current Lexical tree to a minimal Markdown with inline anchor markers
    const markdown = lexicalToMarkdownWithAnchors({ root: { children } });

    const result = LexicalAssembler.assemble({
      text: markdown,
      anchors,
      questions,
      answers,
      astSnippets,
      missingAnchorIds: [],
    });
    return result.assembledState ?? null;
  } catch (error) {
    console.warn('[generateFromTemplate] anchorAssemble failed, falling back to raw editorState', error);
    return null;
  }
}

function containsAnchors(nodes: unknown[]): boolean {
  const stack = [...nodes];
  while (stack.length) {
    const node = stack.pop() as LexicalNode | undefined;
    if (!node) continue;
    if (node.type === 'anchor-node' && typeof node.anchorId === 'string' && node.anchorId.trim()) {
      return true;
    }
    if (node.type === 'text' && typeof node.text === 'string' && node.text.includes('[[CR:TBL|id=')) {
      return true;
    }
    const children = (node as any)?.children;
    if (Array.isArray(children)) {
      for (const child of children) stack.push(child as unknown as LexicalNode);
    }
  }
  return false;
}

function extractInlineText(node: LexicalNode): string {
  if (!node) return '';
  if (node.type === 'text') return String(node.text ?? '');
  if (node.type === 'anchor-node' && typeof node.anchorId === 'string' && node.anchorId.trim()) {
    return `[[CR:TBL|id=${node.anchorId.trim()}]]`;
  }
  const parts: string[] = [];
  const children = (node as any)?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      parts.push(extractInlineText(child as LexicalNode));
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function lexicalToMarkdownWithAnchors(state: LexicalState): string {
  const root = (state?.root ?? {}) as LexicalNode;
  const children = Array.isArray((root as any).children)
    ? ((root as any).children as LexicalNode[])
    : [];

  const blocks: string[] = [];
  for (const node of children) {
    if (!node) continue;
    if (node.type === 'heading') {
      const tag = typeof node.tag === 'string' ? node.tag : 'h1';
      const level = Math.min(Math.max(Number(tag?.replace(/[^0-9]/g, '') || 1), 1), 6);
      const text = extractInlineText(node);
      if (text) blocks.push(`${'#'.repeat(level)} ${text}`);
      continue;
    }
    if (node.type === 'paragraph') {
      const text = extractInlineText(node);
      if (text) blocks.push(text);
      continue;
    }
    if (node.type === 'anchor-node' && typeof node.anchorId === 'string') {
      const id = node.anchorId.trim();
      if (id) blocks.push(`[[CR:TBL|id=${id}]]`);
      continue;
    }
    // Fallback: treat as paragraph-like if it has children/text
    const text = extractInlineText(node);
    if (text) blocks.push(text);
  }
  return blocks.join('\n\n');
}
