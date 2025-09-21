// Mirror of backend/src/types/genPartPlaceholder.ts with light UI helpers

export type GenPartScopeType = 'questions-list';

export type GenPartPlaceholderPolicy =
  | 'remove'
  | 'neutralSentence'
  | 'keepEmpty';

export interface GenPartPlaceholderScope {
  type: GenPartScopeType;
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

export function isGenPartNode(
  value: unknown,
): value is GenPartPlaceholderNodeJSON {
  if (!value || typeof value !== 'object') return false;
  const node = value as GenPartPlaceholderNodeLike;
  if (node.type !== 'gen-part-placeholder') return false;
  if (typeof node.placeholderId !== 'string' || node.placeholderId.length === 0)
    return false;
  if (!node.scope || (node as any).scope?.type !== 'questions-list')
    return false;
  if (!Array.isArray(node.questionIds)) return false;
  if (node.groupId != null && typeof node.groupId !== 'string') return false;
  if ((node as any).version !== 1) return false;
  return true;
}

export function buildEmptyGenPart(
  placeholderId: string,
): GenPartPlaceholderNodeJSON {
  return {
    type: 'gen-part-placeholder',
    placeholderId,
    scope: { type: 'questions-list' },
    questionIds: [],
    recipeId: null,
    policyIfEmpty: null,
    version: 1,
  };
}

export function updateQuestionIds(
  node: GenPartPlaceholderNodeJSON,
  questionIds: string[],
): GenPartPlaceholderNodeJSON {
  return { ...node, questionIds: [...questionIds] };
}
