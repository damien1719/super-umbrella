import { prisma } from '../../prisma';
import { normalizeGenPartsSpecPayload, type GenPartSpecEntry } from '../templateSync.service';
import { genPartPromptConfigs, type GenPartPromptKey } from './prompts/genPart.promptconfig';
import { GENPART_OUTPUT_FORMAT } from './prompts/template/genPartOutputFormat';
import { generateText } from './generate.service';
import { AnchorService, type AnchorSpecification } from './anchor.service';
import { PostProcessor } from './postProcessor';
import { answersToMarkdown, type Question } from '../../utils/answersMarkdown';
import { LexicalAssembler } from '../bilan/lexicalAssembler';
import { buildSectionPromptContext } from './promptContext';
import { ProfileService } from '../profile.service';
import { getInstanceContext, type InstanceContext } from './instanceContext.service';

export type Notes = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export interface GenPartPlaceholderArgs {
  instanceId: string;
  contentNotes: Notes;
  templateContent: unknown;
  genPartsSpec: unknown;
  templateStylePrompt?: string;
  stylePrompt?: string;
  imageBase64?: string;
  contextMd?: string;
}

type LexicalNode = Record<string, unknown> & {
  type?: string;
  children?: unknown;
};

type PlaceholderReplacement = Map<string, LexicalNode[]>;

// InstanceContext is now provided by instanceContext.service

type PlaceholderRuntimeEntry = GenPartSpecEntry & {
  placeholderId: string;
};

function createNeutralParagraph(text: string): LexicalNode {
  return {
    type: 'paragraph',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'text',
        text,
        detail: 0,
        format: 0,
        style: '',
        version: 1,
      },
    ],
  };
}

function ensureQuestionArray(schema: unknown): Question[] {
  return Array.isArray(schema) ? (schema as Question[]) : [];
}

function extractPlaceholderIdsFromAst(ast: unknown): Set<string> {
  const ids = new Set<string>();
  const visit = (node: unknown): void => {
    if (node == null) return;
    if (Array.isArray(node)) {
      for (const child of node) visit(child);
      return;
    }
    if (typeof node === 'object') {
      const record = node as Record<string, unknown>;
      if (record.type === 'gen-part-placeholder' && typeof record.placeholderId === 'string') {
        ids.add(record.placeholderId);
      }
      for (const value of Object.values(record)) {
        if (value && typeof value === 'object') visit(value);
      }
    }
  };
  visit(ast);
  return ids;
}

async function loadInstanceContext(instanceId: string): Promise<InstanceContext> {
  console.log(`[loadInstanceContext] Chargement du contexte pour l'instance ${instanceId}`);
  return getInstanceContext(instanceId);
}

function filterQuestionsByIds(questions: Question[], questionIds: string[]): Question[] {
  const map = new Map<string, Question>();
  for (const question of questions) {
    if (typeof question?.id === 'string') {
      map.set(question.id, question);
    }
  }
  const ordered: Question[] = [];
  for (const id of questionIds) {
    const question = map.get(id);
    if (question) ordered.push(question);
  }
  return ordered;
}

function extractAnswersSubset(questionIds: string[], notes: Notes): Record<string, unknown> {
  const subset: Record<string, unknown> = {};
  if (!questionIds.length) return subset;
  for (const id of questionIds) {
    console.log(`
      [extractAnswersSubset] Extracting answer for question ${id}`);
    console.log('notes', notes);
    if (id in notes) {
      console.log(`
        [extractAnswersSubset] Answer found for question ${id}`);
      subset[id] = notes[id];
    }
  }
  return subset;
}

function hasMeaningfulValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.some((item) => hasMeaningfulValue(item));
  if (typeof value === 'object') {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      if (hasMeaningfulValue(entry)) return true;
    }
    return false;
  }
  return false;
}

function hasMeaningfulAnswers(questionIds: string[], notes: Notes): boolean {
  return questionIds.some((id) => hasMeaningfulValue(notes[id]));
}

function resolvePromptKey(
  entry: PlaceholderRuntimeEntry,
  sectionKind?: string | null,
): GenPartPromptKey | null {
  const candidates = [entry.recipeId, sectionKind, ''];
  for (const raw of candidates) {
    if (!raw) continue;
    const normalized = raw === 'conclusion' ? 'conclusions' : raw;
    if (normalized in genPartPromptConfigs) {
      return normalized as GenPartPromptKey;
    }
  }
  // Fallback vers le prompt générique gen-part
  return 'default' in genPartPromptConfigs ? ('default' as GenPartPromptKey) : null;
}

function combineStylePrompts(...parts: Array<string | undefined | null>): string | undefined {
  const filtered = parts
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter((part) => part.length > 0);
  if (filtered.length === 0) return undefined;
  return filtered.join('\n');
}

function isPlaceholderReplacementToken(value: unknown): value is { __replaceWith: LexicalNode[] } {
  return Boolean(value && typeof value === 'object' && '__replaceWith' in (value as Record<string, unknown>));
}

function makePlaceholderReplacementToken(nodes: LexicalNode[]): { __replaceWith: LexicalNode[] } {
  return { __replaceWith: nodes };
}

function applyPlaceholderReplacements(ast: unknown, replacements: PlaceholderReplacement): unknown {
  const transform = (value: unknown, key?: string): unknown => {
    if (Array.isArray(value)) {
      const result: unknown[] = [];
      for (const item of value) {
        const transformed = transform(item, key === 'children' ? 'children' : undefined);
        if (isPlaceholderReplacementToken(transformed)) {
          result.push(...transformed.__replaceWith);
        } else {
          result.push(transformed);
        }
      }
      return result;
    }

    if (value && typeof value === 'object') {
      const node = value as Record<string, unknown>;
      if (node.type === 'gen-part-placeholder' && typeof node.placeholderId === 'string') {
        const replacement = replacements.get(node.placeholderId);
        if (replacement) {
          return makePlaceholderReplacementToken(replacement);
        }
        if (replacements.has(node.placeholderId)) {
          return makePlaceholderReplacementToken([]);
        }
        return value;
      }

      const copy: Record<string, unknown> = {};
      for (const [prop, propValue] of Object.entries(node)) {
        const transformed = transform(propValue, prop);
        if (isPlaceholderReplacementToken(transformed)) {
          copy[prop] = transformed.__replaceWith;
        } else {
          copy[prop] = transformed;
        }
      }
      return copy;
    }

    return value;
  };

  return transform(ast);
}

async function resolvePlaceholderEntry(
  entry: PlaceholderRuntimeEntry,
  context: InstanceContext,
  notes: Notes,
  templateStylePrompt: string | undefined,
  opts: { stylePrompt?: string; imageBase64?: string; contextMd?: string },
  job: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' | undefined,
): Promise<{ placeholderId: string; nodes: LexicalNode[] } | null> {
  const questionIds = entry.questionIds ?? [];
  const questions = filterQuestionsByIds(context.sectionQuestions, questionIds);
  const answersSubset = extractAnswersSubset(questionIds, notes);

  const key = resolvePromptKey(entry, context.sectionKind);
  if (!key) {
    console.warn('[generateFromTemplate] Unknown prompt config for placeholder', {
      placeholderId: entry.placeholderId,
      recipeId: entry.recipeId,
      sectionKind: context.sectionKind,
    });
    return null;
  }

  const promptConfig = genPartPromptConfigs[key];
  const stylePrompt = combineStylePrompts(templateStylePrompt, opts.stylePrompt);

  const anchors: AnchorSpecification[] = AnchorService.collect(questions);
  const instructions = AnchorService.injectPrompt(promptConfig.instructions, anchors);

  let markdown = '';
  try {

    console.log("answersSubset", answersSubset);
    console.log("questions", questions);
    
    markdown = answersToMarkdown(questions, answersSubset);

    console.log("markdown", markdown);
  } catch (error) {
    console.warn('[generateFromTemplate] Unable to convert answers to markdown', {
      placeholderId: entry.placeholderId,
      error,
    });
  }

  const contextMd = markdown.length > 0 ? markdown : opts.contextMd ?? '';

  const promptContext = context.userId
    ? await buildSectionPromptContext({
        userId: context.userId,
        bilanId: context.bilanId,
        baseContent: contextMd,
        sectionId: context.sectionId,
        fallbackSectionTitle: context.sectionTitle,
        patientNames: context.patientNames,
      })
    : { content: contextMd, patientNames: context.patientNames ?? {} };

  const text = await generateText({
    instructions,
    userContent: promptContext.content,
    examples: [],
    stylePrompt,
    rawNotes: undefined,
    imageBase64: opts.imageBase64,
    job,
    outputFormat: (promptConfig as { outputFormat?: string }).outputFormat ?? GENPART_OUTPUT_FORMAT,
  });

  const { text: processedText, anchorsStatus } = PostProcessor.process({ text: text as string, anchors });

  const assembly = LexicalAssembler.assemble({
    text: processedText,
    anchors,
    missingAnchorIds: anchorsStatus.missing,
    questions,
    answers: answersSubset,
  });

  try {
    const state = JSON.parse(assembly.assembledState ?? '{}') as { root?: { children?: LexicalNode[] } };
    const nodes = Array.isArray(state?.root?.children) ? (state.root.children as LexicalNode[]) : [];
    if (!nodes.length && !hasMeaningfulAnswers(questionIds, notes)) {
      return null;
    }
    return { placeholderId: entry.placeholderId, nodes };
  } catch (error) {
    console.warn('[generateFromTemplate] Unable to parse assembled state', {
      placeholderId: entry.placeholderId,
      error,
    });
    return null;
  }
}

async function buildPlaceholderReplacements(
  placeholderEntries: PlaceholderRuntimeEntry[],
  context: InstanceContext,
  notes: Notes,
  templateStylePrompt: string | undefined,
  opts: { stylePrompt?: string; imageBase64?: string; contextMd?: string },
): Promise<PlaceholderReplacement> {
  console.log(`[buildPlaceholderReplacements] Traitement de ${placeholderEntries.length} placeholders`);
  console.log(`[buildPlaceholderReplacements] Contexte - sectionId: ${context.sectionId}, sectionTitle: ${context.sectionTitle}`);
  const replacements: PlaceholderReplacement = new Map();
  let job: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' | undefined;
  if (context.userId) {
    const profiles = (await ProfileService.list(context.userId)) as unknown as Array<{ job?: typeof job }>;
    job = profiles && profiles.length > 0 ? profiles[0]?.job ?? undefined : undefined;
  }
  for (const entry of placeholderEntries) {
    try {
      console.log(`[buildPlaceholderReplacements] Traitement du placeholder ${entry.placeholderId} (${entry.questionIds?.join(', ') || 'sans questions'})`);
      const result = await resolvePlaceholderEntry(entry, context, notes, templateStylePrompt, opts, job);
      if (result) {
        console.log(`[buildPlaceholderReplacements] Placeholder ${entry.placeholderId} traité avec succès (${result.nodes.length} nœuds générés)`);
      } else {
        console.log(`[buildPlaceholderReplacements] Aucun résultat pour le placeholder ${entry.placeholderId}`);
      }
      if (result) {
        replacements.set(entry.placeholderId, result.nodes);
        continue;
      }

      if (entry.policyIfEmpty === 'keepEmpty') {
        continue;
      }

      if (entry.policyIfEmpty === 'neutralSentence') {
        replacements.set(
          entry.placeholderId,
          [createNeutralParagraph("Aucune information n'a ete fournie pour cette partie.")],
        );
        continue;
      }

      replacements.set(entry.placeholderId, []);
    } catch (error) {
      console.error('[generateFromTemplate] Placeholder generation failed', {
        placeholderId: entry.placeholderId,
        error,
      });
      throw error;
    }
  }
  return replacements;
}

export async function applyGenPartPlaceholders({
  instanceId,
  contentNotes,
  templateContent,
  genPartsSpec,
  templateStylePrompt,
  stylePrompt,
  imageBase64,
  contextMd,
}: GenPartPlaceholderArgs): Promise<unknown> {
  console.log('[applyGenPartPlaceholders] Début du traitement des placeholders');
  console.log(`[applyGenPartPlaceholders] Instance ID: ${instanceId}`);
  console.log(`[applyGenPartPlaceholders] Nombre de notes: ${Object.keys(contentNotes).length}`);
  const placeholderIds = extractPlaceholderIdsFromAst(templateContent);

  console.log('contentNotes', contentNotes);

  console.log(`[applyGenPartPlaceholders] ${placeholderIds.size} placeholders trouvés dans le template`);
  const normalizedGenPartsSpec = normalizeGenPartsSpecPayload(genPartsSpec);
  const placeholderEntries: PlaceholderRuntimeEntry[] = [];
  for (const [placeholderId, entry] of Object.entries(normalizedGenPartsSpec.genPartsSpec)) {
    if (!placeholderIds.has(placeholderId)) continue;
    console.log(`[applyGenPartPlaceholders] Traitement du placeholder ${placeholderId} avec la spécification:`, 
      JSON.stringify(entry, null, 2));
    placeholderEntries.push({ ...entry, placeholderId });
  }

  if (placeholderEntries.length === 0) {
    return templateContent;
  }

  const context = await loadInstanceContext(instanceId);
  const replacements = await buildPlaceholderReplacements(placeholderEntries, context, contentNotes, templateStylePrompt, {
    stylePrompt,
    imageBase64,
    contextMd,
  });

  if (replacements.size === 0) {
    return templateContent;
  }
  console.log(`[applyGenPartPlaceholders] Application des remplacements pour ${replacements.size} placeholders`);
  const result = applyPlaceholderReplacements(
    JSON.parse(JSON.stringify(templateContent)),
    replacements,
  );
  console.log('[applyGenPartPlaceholders] Traitement des placeholders terminé');
  return result;
}

export const _test = {
  ensureQuestionArray,
  extractPlaceholderIdsFromAst,
  filterQuestionsByIds,
  extractAnswersSubset,
  hasMeaningfulAnswers,
  applyPlaceholderReplacements,
  combineStylePrompts,
};
