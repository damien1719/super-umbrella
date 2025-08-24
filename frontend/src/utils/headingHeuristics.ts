interface HeadingCandidateParams {
  text: string;
  isHeadingNode: boolean;
  nextIsEmptyParagraph: boolean;
}

/**
 * Determine if a block of text should be considered a heading.
 * Conservative heuristics (V0):
 * - Already a HeadingNode (h1/h2/h3)
 * - Text ends with ':' and is short (<= 120 chars)
 * - Text is mostly uppercase and next line is empty
 */
export function isHeadingCandidate({
  text,
  isHeadingNode,
  nextIsEmptyParagraph,
}: HeadingCandidateParams): boolean {
  if (isHeadingNode) {
    return true;
  }

  const trimmed = text.trim();

  if (trimmed.endsWith(':') && trimmed.length <= 120) {
    return true;
  }

  const letters = trimmed.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 0) {
    const upper = letters.replace(/[^A-Z]/g, '').length;
    const ratio = upper / letters.length;
    if (ratio >= 0.6 && nextIsEmptyParagraph) {
      return true;
    }
  }

  return false;
}
