/**
 * Canonical JSON payload for the Lexical GenPartPlaceholder node.
 * Invariants (shared front/back):
 * - `placeholderId` is stable and unique within a layout.
 * - `scope.type` currently only supports `questions-list`.
 * - `questionIds` preserves display order and is the reference for reordering.
 * - Optional metadata (`recipeId`, `policyIfEmpty`, `deps`) mirrors persistence but is
 *   always derived server-side.
 */
export type GenPartScopeType = 'questions-list';

export type GenPartPlaceholderPolicy = 'remove' | 'neutralSentence' | 'keepEmpty';

export interface GenPartPlaceholderScope {
  type: GenPartScopeType;
  // Reserved for future expansion (e.g. contextual metadata)
  meta?: Record<string, unknown>;
}

export interface GenPartPlaceholderNodeJSON {
  type: 'gen-part-placeholder';
  placeholderId: string;
  groupId?: string;
  scope: GenPartPlaceholderScope;
  questionIds: string[];
  recipeId?: string | null;
  policyIfEmpty?: GenPartPlaceholderPolicy | null;
  deps?: string[];
  version: 1;
}

export type GenPartPlaceholderNodeLike = Partial<GenPartPlaceholderNodeJSON> & {
  type?: unknown;
  placeholderId?: unknown;
  scope?: unknown;
  questionIds?: unknown;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isScope(value: unknown): value is GenPartPlaceholderScope {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { type?: unknown };
  return candidate.type === 'questions-list';
}

export function isGenPartNode(value: unknown): value is GenPartPlaceholderNodeJSON {
  if (!value || typeof value !== 'object') return false;
  const node = value as GenPartPlaceholderNodeLike;
  if (node.type !== 'gen-part-placeholder') return false;
  if (typeof node.placeholderId !== 'string' || node.placeholderId.length === 0)
    return false;
  if (!isScope(node.scope)) return false;
  if (!isStringArray(node.questionIds)) return false;
  if (node.groupId != null && typeof node.groupId !== 'string') return false;

  if (
    node.policyIfEmpty != null &&
    node.policyIfEmpty !== 'remove' &&
    node.policyIfEmpty !== 'neutralSentence' &&
    node.policyIfEmpty !== 'keepEmpty'
  ) {
    return false;
  }

  if (node.deps != null && !isStringArray(node.deps)) return false;
  if (node.recipeId != null && typeof node.recipeId !== 'string') return false;
  if (node.version !== 1) return false;
  return true;
}

export function assertGenPartNode(value: unknown): asserts value is GenPartPlaceholderNodeJSON {
  if (!isGenPartNode(value)) {
    throw new Error('GenPartPlaceholderNodeJSON expected');
  }
}

export function readQuestionIds(value: unknown): string[] {
  return isGenPartNode(value) ? [...value.questionIds] : [];
}

export function withPolicy(
  node: GenPartPlaceholderNodeJSON,
  policy: GenPartPlaceholderPolicy | null | undefined,
): GenPartPlaceholderNodeJSON {
  return {
    ...node,
    policyIfEmpty: policy ?? null,
  };
}

export function cloneGenPartNode(
  node: GenPartPlaceholderNodeJSON,
  overrides: Partial<GenPartPlaceholderNodeJSON> = {},
): GenPartPlaceholderNodeJSON {
  return {
    ...node,
    ...overrides,
    groupId: overrides.groupId ?? node.groupId,
    questionIds: overrides.questionIds ?? [...node.questionIds],
    deps: overrides.deps ? [...overrides.deps] : node.deps ? [...node.deps] : undefined,
  };
}

export function normalizeGenPartNode(
  candidate: GenPartPlaceholderNodeLike,
): GenPartPlaceholderNodeJSON | null {
  if (!isGenPartNode(candidate)) return null;
  return {
    type: 'gen-part-placeholder',
    placeholderId: candidate.placeholderId,
    groupId: typeof candidate.groupId === 'string' ? candidate.groupId : undefined,
    scope: candidate.scope,
    questionIds: [...candidate.questionIds],
    recipeId: candidate.recipeId ?? null,
    policyIfEmpty: candidate.policyIfEmpty ?? null,
    deps: candidate.deps ? [...candidate.deps] : undefined,
    version: 1,
  };
}
