/**
 * Canonical JSON payload for the Lexical Anchor node used to mark
 * client-rendered table insertion points.
 */
export type AnchorNodeType = 'anchor-node';

export interface AnchorNodeJSON {
  type: AnchorNodeType;
  /** Currently only 'CR:TBL' is supported */
  anchorType?: 'CR:TBL';
  /** Logical anchor identifier (e.g., 'T1') */
  anchorId: string;
  /** Optional grouping identifier to align with placeholders */
  groupId?: string;
  /** Optional originating question id (when known) */
  questionId?: string;
  version: 1;
}

export type AnchorNodeLike = Partial<AnchorNodeJSON> & {
  type?: unknown;
  anchorId?: unknown;
};

export function isAnchorNode(value: unknown): value is AnchorNodeJSON {
  if (!value || typeof value !== 'object') return false;
  const node = value as AnchorNodeLike;
  if (node.type !== 'anchor-node') return false;
  if (typeof node.anchorId !== 'string' || node.anchorId.trim().length === 0) return false;
  if (node.groupId != null && typeof node.groupId !== 'string') return false;
  if (node.questionId != null && typeof node.questionId !== 'string') return false;
  if (node.anchorType != null && node.anchorType !== 'CR:TBL') return false;
  if (node.version !== 1) return false;
  return true;
}

export function createAnchorNode(input: {
  anchorId: string;
  groupId?: string;
  questionId?: string;
}): AnchorNodeJSON {
  return {
    type: 'anchor-node',
    anchorType: 'CR:TBL',
    anchorId: input.anchorId.trim(),
    groupId: input.groupId,
    questionId: input.questionId,
    version: 1,
  };
}

