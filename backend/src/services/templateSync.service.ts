import { randomUUID } from 'crypto';
import {
  cloneGenPartNode,
  isGenPartNode,
  normalizeGenPartNode,
  type GenPartPlaceholderNodeJSON,
  type GenPartPlaceholderPolicy,
} from '../types/genPartPlaceholder';

// Generic Lexical structures used in the sync service
export type LexicalNode = Record<string, unknown> & {
  type?: string;
  children?: unknown;
};

export interface LexicalState {
  root?: LexicalNode;
}

export interface GenPartSpecEntry {
  groupId: string | null;
  questionIds: string[];
  recipeId?: string | null;
  policyIfEmpty?: GenPartPlaceholderPolicy | null;
  deps?: string[];
}

export type GenPartsSpecMap = Record<string, GenPartSpecEntry>;

export interface GenPartsSpec {
  genPartsSpec: GenPartsSpecMap;
  specVersion: number;
}

export interface TemplateSyncReport {
  createdPlaceholderIds: string[];
  reusedPlaceholderIds: string[];
  removedPlaceholderIds: string[];
  splitPlaceholderIds: string[];
  injectedHeadingIds: string[];
  addedQuestionIds: string[];
  removedQuestionIds: string[];
  notes: string[];
}

interface QuestionRecord {
  id: string;
  type: string;
  titre?: string;
  source: Record<string, unknown>;
}

interface QuestionGroup {
  heading: QuestionRecord | null;
  questions: QuestionRecord[];
}

function deepClone<T>(value: T): T {
  if (value == null) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value == null) return [] as T[];
  return [value as T];
}

function collectQuestions(schema: unknown): QuestionRecord[] {
  if (!Array.isArray(schema)) return [];
  const out: QuestionRecord[] = [];
  for (const item of schema) {
    if (!item || typeof item !== 'object') continue;
    const ref = item as Record<string, unknown>;
    const id = ref.id;
    const type = ref.type;
    if (typeof id !== 'string' || id.length === 0) continue;
    if (typeof type !== 'string' || type.length === 0) continue;
    out.push({ id, type, titre: typeof ref.titre === 'string' ? (ref.titre as string) : undefined, source: ref });
  }
  return out;
}

function buildGroups(questions: QuestionRecord[]): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  let current: QuestionGroup = { heading: null, questions: [] };

  const pushCurrent = () => {
    if (current.heading || current.questions.length > 0) {
      groups.push(current);
    }
  };

  for (const question of questions) {
    if (question.type === 'titre') {
      pushCurrent();
      current = { heading: question, questions: [] };
    } else {
      current.questions.push(question);
    }
  }

  pushCurrent();
  return groups;
}

function ensureUniqueId(base: string, used: Set<string>): string {
  const sanitizedBase = base.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'placeholder';
  let candidate = sanitizedBase;
  let idx = 1;
  while (used.has(candidate)) {
    candidate = `${sanitizedBase}-${idx++}`;
  }
  used.add(candidate);
  return candidate;
}

function makePlaceholderId(
  groupIndex: number,
  group: QuestionGroup,
  used: Set<string>,
): string {
  const fromHeading = group.heading?.id;
  const fromFirstQuestion = group.questions[0]?.id;
  const base = fromHeading ?? fromFirstQuestion ?? `group-${groupIndex}`;
  return ensureUniqueId(`gen-${base}`, used);
}

function toSpecEntry(node: GenPartPlaceholderNodeJSON): GenPartSpecEntry {
  const deps = Array.isArray(node.deps) && node.deps.length ? [...node.deps] : undefined;
  return {
    groupId: typeof node.groupId === 'string' ? node.groupId : null,
    questionIds: [...node.questionIds],
    recipeId: node.recipeId ?? null,
    policyIfEmpty: node.policyIfEmpty ?? null,
    deps,
  };
}

function createHeadingNode(title: string, headingId: string | null, groupId: string): LexicalNode {
  return {
    type: 'heading',
    tag: 'h2',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    headingId: headingId ?? undefined,
    groupId,
    data: {
      headingId: headingId ?? null,
      groupId,
    },
    children: [
      {
        type: 'text',
        text: title,
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        version: 1,
      },
    ],
  } as LexicalNode;
}

function createPlaceholderNode(node: GenPartPlaceholderNodeJSON): LexicalNode {
  return cloneGenPartNode(node) as unknown as LexicalNode;
}

function createReport(): TemplateSyncReport {
  return {
    createdPlaceholderIds: [],
    reusedPlaceholderIds: [],
    removedPlaceholderIds: [],
    splitPlaceholderIds: [],
    injectedHeadingIds: [],
    addedQuestionIds: [],
    removedQuestionIds: [],
    notes: [],
  };
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

function finalizeReport(report: TemplateSyncReport): TemplateSyncReport {
  return {
    createdPlaceholderIds: dedupe(report.createdPlaceholderIds),
    reusedPlaceholderIds: dedupe(report.reusedPlaceholderIds),
    removedPlaceholderIds: dedupe(report.removedPlaceholderIds),
    splitPlaceholderIds: dedupe(report.splitPlaceholderIds),
    injectedHeadingIds: dedupe(report.injectedHeadingIds),
    addedQuestionIds: dedupe(report.addedQuestionIds),
    removedQuestionIds: dedupe(report.removedQuestionIds),
    notes: dedupe(report.notes),
  };
}

function uniqueOrdered(values: string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const value of values) {
    if (typeof value !== 'string' || value.length === 0) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    ordered.push(value);
  }
  return ordered;
}

function normalizeSpecEntry(placeholderId: string, value: unknown): GenPartSpecEntry {
  if (!value || typeof value !== 'object') {
    return {
      groupId: `grp-${placeholderId}`,
      questionIds: [],
      recipeId: null,
      policyIfEmpty: null,
      deps: [],
    };
  }

  const candidate = value as Partial<GenPartSpecEntry> & {
    questionIds?: unknown;
    deps?: unknown;
    recipeId?: unknown;
    policyIfEmpty?: unknown;
    groupId?: unknown;
  };

  const questionIds = Array.isArray(candidate.questionIds)
    ? uniqueOrdered(candidate.questionIds.filter((id): id is string => typeof id === 'string'))
    : [];

  const groupId =
    typeof candidate.groupId === 'string' && candidate.groupId.length > 0
      ? candidate.groupId
      : `grp-${placeholderId}`;

  const recipeId =
    candidate.recipeId == null || typeof candidate.recipeId === 'string'
      ? (candidate.recipeId as string | null | undefined) ?? null
      : null;

  const policy =
    candidate.policyIfEmpty === 'remove' ||
    candidate.policyIfEmpty === 'neutralSentence' ||
    candidate.policyIfEmpty === 'keepEmpty'
      ? candidate.policyIfEmpty
      : null;

  const deps =
    Array.isArray(candidate.deps) && candidate.deps.every((dep) => typeof dep === 'string')
      ? [...(candidate.deps as string[])]
      : [];

  return {
    groupId,
    questionIds,
    recipeId,
    policyIfEmpty: policy,
    deps,
  };
}

export function normalizeGenPartsSpecPayload(raw: unknown): GenPartsSpec {
  if (!raw || typeof raw !== 'object') {
    return { genPartsSpec: {}, specVersion: 2 };
  }

  const candidate = raw as { genPartsSpec?: unknown; specVersion?: unknown };
  if (candidate.genPartsSpec && typeof candidate.genPartsSpec === 'object') {
    const entries = candidate.genPartsSpec as Record<string, unknown>;
    const normalized: GenPartsSpecMap = {};
    for (const [placeholderId, entry] of Object.entries(entries)) {
      normalized[placeholderId] = normalizeSpecEntry(placeholderId, entry);
    }
    const version =
      typeof candidate.specVersion === 'number' && !Number.isNaN(candidate.specVersion)
        ? candidate.specVersion
        : 2;
    return { genPartsSpec: normalized, specVersion: version };
  }

  const fallbackEntries = raw as Record<string, unknown>;
  const normalized: GenPartsSpecMap = {};
  for (const [placeholderId, entry] of Object.entries(fallbackEntries)) {
    normalized[placeholderId] = normalizeSpecEntry(placeholderId, entry);
  }
  return { genPartsSpec: normalized, specVersion: 1 };
}

interface HeadingMetadata {
  headingId: string | null;
  groupId: string | null;
}

interface PlaceholderInfo {
  placeholderId: string;
  entry: GenPartSpecEntry;
}

function readHeadingMetadata(node: LexicalNode): HeadingMetadata | null {
  if (!node || typeof node !== 'object') return null;
  if (node.type !== 'heading' && node.type !== 'group-heading') return null;

  const directHeadingId =
    typeof (node as { headingId?: unknown }).headingId === 'string'
      ? ((node as { headingId?: unknown }).headingId as string)
      : null;
  const directGroupId =
    typeof (node as { groupId?: unknown }).groupId === 'string'
      ? ((node as { groupId?: unknown }).groupId as string)
      : null;

  const data = (node as { data?: unknown }).data;
  const dataHeadingId =
    data && typeof data === 'object' && typeof (data as { headingId?: unknown }).headingId === 'string'
      ? ((data as { headingId?: unknown }).headingId as string)
      : null;
  const dataGroupId =
    data && typeof data === 'object' && typeof (data as { groupId?: unknown }).groupId === 'string'
      ? ((data as { groupId?: unknown }).groupId as string)
      : null;

  const headingId = directHeadingId ?? dataHeadingId;
  const groupId = directGroupId ?? dataGroupId;

  if (!headingId && !groupId) return null;

  return {
    headingId: headingId ?? null,
    groupId: groupId ?? null,
  };
}

function collectHeadingMetadata(layout: LexicalState | null | undefined): HeadingMetadata[] {
  if (!layout?.root || typeof layout.root !== 'object') return [];
  const children = asArray<LexicalNode>((layout.root as LexicalNode).children ?? []);
  const result: HeadingMetadata[] = [];
  for (const child of children) {
    const metadata = readHeadingMetadata(child);
    if (metadata) result.push(metadata);
  }
  return result;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false;
  }
  return true;
}

function resolveGroupId(
  group: QuestionGroup,
  groupIndex: number,
  headingToGroupId: Map<string, string>,
  questionToGroupId: Map<string, string>,
  assignedGroupIds: Set<string>,
  existingGroupIds: Set<string>,
): string {
  const headingId = group.heading?.id;
  if (headingId) {
    const candidate = headingToGroupId.get(headingId);
    if (candidate && !assignedGroupIds.has(candidate)) {
      assignedGroupIds.add(candidate);
      return candidate;
    }
  }

  for (const question of group.questions) {
    const candidate = questionToGroupId.get(question.id);
    if (candidate && !assignedGroupIds.has(candidate)) {
      assignedGroupIds.add(candidate);
      return candidate;
    }
  }

  const seed = group.heading?.id ?? group.questions[0]?.id ?? `group-${groupIndex}`;
  const newGroupId = ensureUniqueId(`grp-${seed}`, existingGroupIds);
  assignedGroupIds.add(newGroupId);
  return newGroupId;
}

function recordQuestionDiff(
  previousEntry: GenPartSpecEntry | undefined,
  nextQuestionIds: string[],
  report: TemplateSyncReport,
): void {
  const previousIds = previousEntry?.questionIds ?? [];
  const previousSet = new Set(previousIds);
  const nextSet = new Set(nextQuestionIds);

  for (const id of nextQuestionIds) {
    if (!previousSet.has(id)) report.addedQuestionIds.push(id);
  }

  for (const id of previousIds) {
    if (!nextSet.has(id)) report.removedQuestionIds.push(id);
  }
}

function selectPlaceholder(
  group: QuestionGroup,
  groupIndex: number,
  groupId: string,
  questionIds: string[],
  placeholdersByGroup: Map<string, PlaceholderInfo[]>,
  assignedPlaceholderIds: Set<string>,
  placeholderIdPool: Set<string>,
  report: TemplateSyncReport,
): {
  placeholderId: string;
  entry: GenPartSpecEntry;
  previousEntry?: GenPartSpecEntry;
  reused: boolean;
} {
  const bucket = placeholdersByGroup.get(groupId) ?? [];
  const available = bucket.filter((info) => !assignedPlaceholderIds.has(info.placeholderId));
  const reuse = available.find((info) => arraysEqual(info.entry.questionIds, questionIds)) ?? available[0];

  if (reuse) {
    assignedPlaceholderIds.add(reuse.placeholderId);
    report.reusedPlaceholderIds.push(reuse.placeholderId);
    const previousEntry = reuse.entry;
    if (bucket.length) {
      const idx = bucket.findIndex((info) => info.placeholderId === reuse.placeholderId);
      if (idx >= 0) bucket.splice(idx, 1);
    }
    const entry: GenPartSpecEntry = {
      groupId,
      questionIds: [...questionIds],
      recipeId: previousEntry.recipeId ?? null,
      policyIfEmpty: previousEntry.policyIfEmpty ?? null,
      deps: previousEntry.deps ? [...previousEntry.deps] : [],
    };
    return { placeholderId: reuse.placeholderId, entry, previousEntry, reused: true };
  }

  const placeholderId = makePlaceholderId(groupIndex, group, placeholderIdPool);
  assignedPlaceholderIds.add(placeholderId);
  report.createdPlaceholderIds.push(placeholderId);
  const entry: GenPartSpecEntry = {
    groupId,
    questionIds: [...questionIds],
    recipeId: null,
    policyIfEmpty: null,
    deps: [],
  };
  return { placeholderId, entry, previousEntry: undefined, reused: false };
}

function mergeTargetNodes(
  previousChildren: LexicalNode[],
  targetNodes: LexicalNode[],
): LexicalNode[] {
  if (previousChildren.length === 0) return targetNodes;

  const queue = [...targetNodes];
  const merged: LexicalNode[] = [];

  for (const child of previousChildren) {
    if (child && typeof child === 'object' && (child.type === 'heading' || child.type === 'group-heading' || isGenPartNode(child))) {
      if (queue.length) {
        merged.push(queue.shift()!);
      }
      continue;
    }
    merged.push(deepClone(child));
  }

  while (queue.length) {
    merged.push(queue.shift()!);
  }

  return merged;
}

export interface SchemaToLayoutResult {
  content: LexicalState;
  genPartsSpec: GenPartsSpec;
  report: TemplateSyncReport;
}

export function schemaToLayout(
  schema: unknown,
  previousLayout?: LexicalState | null,
  previousGenPartsSpec?: unknown,
): SchemaToLayoutResult {
  const questions = collectQuestions(schema);
  const groups = buildGroups(questions);
  const report = createReport();

  const normalizedSpec = normalizeGenPartsSpecPayload(previousGenPartsSpec);
  const previousSpecMap = normalizedSpec.genPartsSpec;

  const existingGroupIds = new Set<string>();
  const questionToGroupId = new Map<string, string>();
  const placeholdersByGroup = new Map<string, PlaceholderInfo[]>();
  const previousPlaceholderIds = new Set<string>();

  for (const [placeholderId, entry] of Object.entries(previousSpecMap)) {
    if (entry.groupId) {
      existingGroupIds.add(entry.groupId);
      const bucket = placeholdersByGroup.get(entry.groupId) ?? [];
      bucket.push({ placeholderId, entry });
      placeholdersByGroup.set(entry.groupId, bucket);
      for (const questionId of entry.questionIds) {
        questionToGroupId.set(questionId, entry.groupId);
      }
    } else {
      existingGroupIds.add(`grp-${placeholderId}`);
      for (const questionId of entry.questionIds) {
        questionToGroupId.set(questionId, `grp-${placeholderId}`);
      }
    }
    previousPlaceholderIds.add(placeholderId);
  }

  const headingMetadata = collectHeadingMetadata(previousLayout ?? null);
  const headingToGroupId = new Map<string, string>();
  for (const meta of headingMetadata) {
    if (meta.headingId && meta.groupId) {
      headingToGroupId.set(meta.headingId, meta.groupId);
      existingGroupIds.add(meta.groupId);
    }
  }

  const assignedGroupIds = new Set<string>();
  const placeholderIdPool = new Set<string>(previousPlaceholderIds);
  const assignedPlaceholderIds = new Set<string>();
  const remainingPlaceholderIds = new Set<string>(previousPlaceholderIds);
  const targetNodes: LexicalNode[] = [];
  const nextSpecMap: GenPartsSpecMap = {};
  const usedQuestionIds = new Set<string>();

  groups.forEach((group, groupIndex) => {
    const groupId = resolveGroupId(
      group,
      groupIndex,
      headingToGroupId,
      questionToGroupId,
      assignedGroupIds,
      existingGroupIds,
    );

    if (group.heading) {
      const headingId = group.heading.id;
      const title = group.heading.titre ?? '';
      if (!headingToGroupId.has(headingId)) {
        report.injectedHeadingIds.push(headingId);
      }
      headingToGroupId.set(headingId, groupId);
      targetNodes.push(createHeadingNode(title, headingId, groupId));
    }

    const questionIds = uniqueOrdered(group.questions.map((q) => q.id));
    if (questionIds.length === 0) {
      return;
    }

    const selection = selectPlaceholder(
      group,
      groupIndex,
      groupId,
      questionIds,
      placeholdersByGroup,
      assignedPlaceholderIds,
      placeholderIdPool,
      report,
    );

    selection.entry.groupId = groupId;
    nextSpecMap[selection.placeholderId] = selection.entry;

    if (selection.reused) {
      remainingPlaceholderIds.delete(selection.placeholderId);
    }

    recordQuestionDiff(selection.previousEntry, selection.entry.questionIds, report);

    for (const questionId of selection.entry.questionIds) {
      if (usedQuestionIds.has(questionId)) {
        report.notes.push(`Question ${questionId} assigned multiple times; keeping latest order.`);
      }
      usedQuestionIds.add(questionId);
    }

    targetNodes.push(
      createPlaceholderNode({
        type: 'gen-part-placeholder',
        placeholderId: selection.placeholderId,
        groupId: selection.entry.groupId ?? undefined,
        scope: { type: 'questions-list' },
        questionIds: selection.entry.questionIds,
        recipeId: selection.entry.recipeId ?? null,
        policyIfEmpty: selection.entry.policyIfEmpty ?? null,
        deps: selection.entry.deps ? [...selection.entry.deps] : undefined,
        version: 1,
      }),
    );
  });

  for (const removedId of remainingPlaceholderIds) {
    report.removedPlaceholderIds.push(removedId);
    const previousEntry = previousSpecMap[removedId];
    if (previousEntry) {
      for (const questionId of previousEntry.questionIds) {
        if (!usedQuestionIds.has(questionId)) {
          report.removedQuestionIds.push(questionId);
        }
      }
    }
  }

  const baseChildren = asArray<LexicalNode>((previousLayout?.root as LexicalNode)?.children ?? []);
  const mergedChildren = mergeTargetNodes(baseChildren, targetNodes);

  const baseRoot = deepClone((previousLayout?.root ?? {}) as LexicalNode);
  const root: LexicalNode = {
    ...baseRoot,
    type: typeof baseRoot.type === 'string' ? (baseRoot.type as string) : 'root',
    format: typeof baseRoot.format === 'string' ? (baseRoot.format as string) : '',
    indent: typeof baseRoot.indent === 'number' ? (baseRoot.indent as number) : 0,
    direction: typeof baseRoot.direction === 'string' ? (baseRoot.direction as string) : 'ltr',
    version: typeof baseRoot.version === 'number' ? (baseRoot.version as number) : 1,
    children: mergedChildren,
  };

  const content: LexicalState = { root };

  const specVersion = normalizedSpec.specVersion >= 2 ? normalizedSpec.specVersion : 2;
  const genPartsSpec: GenPartsSpec = {
    genPartsSpec: nextSpecMap,
    specVersion,
  };

  return { content, genPartsSpec, report: finalizeReport(report) };
}

function extractPlainText(node: LexicalNode | undefined): string {
  if (!node) return '';
  if (typeof node.text === 'string') return node.text;
  const children = asArray<LexicalNode>(node.children ?? []);
  return children.map((child) => extractPlainText(child)).join('');
}

function walkNodes(nodes: LexicalNode[]): LexicalNode[] {
  const out: LexicalNode[] = [];
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'heading' || isGenPartNode(node)) {
      out.push(node);
      continue;
    }
    const children = asArray<LexicalNode>(node.children ?? []);
    if (children.length) {
      out.push(...walkNodes(children));
    }
  }
  return out;
}

export interface LayoutToSchemaResult {
  schema: unknown;
  content: LexicalState;
  genPartsSpec: GenPartsSpec;
  report: TemplateSyncReport;
}

export function layoutToSchema(
  content: LexicalState,
  baseSchema: unknown,
): LayoutToSchemaResult {
  const workingContent = deepClone(content ?? {});
  const root = (workingContent?.root ?? {}) as LexicalNode;
  const nodes = walkNodes(asArray<LexicalNode>(root.children ?? []));

  const baseQuestions = collectQuestions(baseSchema);
  const questionMap = new Map<string, QuestionRecord>();
  for (const item of baseQuestions) {
    questionMap.set(item.id, item);
  }

  const headingPool = baseQuestions.filter((q) => q.type === 'titre');
  let headingIndex = 0;

  const usedQuestionIds = new Set<string>();
  const newSchema: Record<string, unknown>[] = [];
  const genPartsSpecMap: GenPartsSpecMap = {};
  const report = createReport();

  const sanitizePlaceholder = (node: GenPartPlaceholderNodeJSON) => {
    const seen = new Set<string>();
    const sanitizedIds: string[] = [];
    for (const id of node.questionIds) {
      if (typeof id !== 'string' || id.length === 0) continue;
      if (seen.has(id)) {
        report.notes.push(`Duplicate questionId ${id} ignored in placeholder ${node.placeholderId}`);
        continue;
      }
      seen.add(id);
      const question = questionMap.get(id);
      if (!question) {
        report.removedQuestionIds.push(id);
        continue;
      }
      if (usedQuestionIds.has(id)) {
        report.notes.push(`Question ${id} already assigned; skipped from placeholder ${node.placeholderId}`);
        continue;
      }
      sanitizedIds.push(id);
      usedQuestionIds.add(id);
      newSchema.push(deepClone(question.source));
    }

    const groupId =
      typeof node.groupId === 'string' && node.groupId.length > 0
        ? node.groupId
        : `grp-${node.placeholderId}`;

    return { ...node, groupId, questionIds: sanitizedIds } as GenPartPlaceholderNodeJSON;
  };

  const placeholderUpdates = new Map<string, GenPartPlaceholderNodeJSON>();

  for (const node of nodes) {
    if (node.type === 'heading') {
      const text = extractPlainText(node) ?? '';
      const existingHeading = headingPool[headingIndex++];
      if (existingHeading) {
        const clone = deepClone(existingHeading.source);
        clone.titre = text;
        newSchema.push(clone);
        usedQuestionIds.add(existingHeading.id);
      } else {
        const headingQuestion = {
          id: randomUUID(),
          type: 'titre',
          titre: text,
        } as Record<string, unknown>;
        newSchema.push(headingQuestion);
        report.injectedHeadingIds.push(headingQuestion.id as string);
      }
      continue;
    }

    if (isGenPartNode(node)) {
      const normalized = normalizeGenPartNode(node);
      if (!normalized) {
        report.notes.push('Invalid gen-part-placeholder node encountered');
        continue;
      }
      const sanitized = sanitizePlaceholder(normalized);
      placeholderUpdates.set(sanitized.placeholderId, sanitized);
      genPartsSpecMap[sanitized.placeholderId] = toSpecEntry(sanitized);
    }
  }

  for (const question of baseQuestions) {
    if (!usedQuestionIds.has(question.id)) {
      report.removedQuestionIds.push(question.id);
    }
  }

  const applySanitizedPlaceholders = (node: unknown): unknown => {
    if (!node || typeof node !== 'object') return node;
    if (isGenPartNode(node)) {
      const updated = placeholderUpdates.get(node.placeholderId);
      return updated ? cloneGenPartNode(updated) : node;
    }
    const copy = { ...(node as Record<string, unknown>) };
    if (Array.isArray(copy.children)) {
      copy.children = copy.children.map((child) => applySanitizedPlaceholders(child)) as unknown;
    }
    return copy;
  };

  const sanitizedRoot = applySanitizedPlaceholders(root) as LexicalNode;
  const sanitizedContent: LexicalState = {
    root: sanitizedRoot,
  };

  return {
    schema: newSchema,
    content: sanitizedContent,
    genPartsSpec: {
      genPartsSpec: genPartsSpecMap,
      specVersion: 2,
    },
    report: finalizeReport(report),
  };
}
