export function prependSectionContext(content: string, sectionName?: string | null): string {
  const name = (sectionName ?? "").toString().trim();
  if (!name) return content;
  return `Contexte: "${name}" ---\n${content}`;
}

