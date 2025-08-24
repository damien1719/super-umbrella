interface HeadingCandidateParams {
  text: string;
  isHeadingNode: boolean;
  nextIsEmptyParagraph: boolean;
  hasBold?: boolean;
  hasUnderline?: boolean;
}

/**
 * Determine if a block of text should be considered a heading.
 * Conservative heuristics (V0):
 * - Already a HeadingNode (h1/h2/h3)
 * - Text ends with ':' and is short (<= 120 chars)
 * - Text is mostly uppercase and next line is empty
 * - Text is short and has bold/underline formatting
 */
export function isHeadingCandidate({
  text,
  isHeadingNode,
  nextIsEmptyParagraph,
  hasBold = false,
  hasUnderline = false,
}: HeadingCandidateParams): boolean {
  if (isHeadingNode) {
    return true;
  }

  const trimmed = text.trim();

  // Règle 1: Texte se terminant par ':' et court
  if (trimmed.endsWith(':') && trimmed.length <= 120) {
    return true;
  }

  // Règle 2: Texte court avec formatage gras ou souligné
  if (trimmed.length <= 80 && (hasBold || hasUnderline)) {
    return true;
  }

  // Règle 3: Texte en majuscules avec ligne suivante vide
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
