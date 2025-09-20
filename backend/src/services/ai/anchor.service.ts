import type { Question } from '../../utils/answersMarkdown';

export type AnchorSpec = {
  type: 'CR:TBL';
  id: string;
  questionId: string;
};

function isTableQuestion(question: Question): question is Question & { tableau: { crInsert?: boolean; crTableId?: string } } {
  return question?.type === 'tableau' && typeof (question as any)?.tableau === 'object' && (question as any)?.tableau !== null;
}

function normalizeId(raw: string): string {
  return raw.trim();
}

export function collect(questions: Question[] | null | undefined): AnchorSpec[] {
  if (!Array.isArray(questions)) return [];
  const anchors: AnchorSpec[] = [];
  for (const question of questions) {
    if (!isTableQuestion(question)) continue;
    const table = (question as any).tableau as { crInsert?: boolean; crTableId?: string };
    if (!table?.crInsert) continue;
    if (typeof table.crTableId !== 'string') continue;
    const id = normalizeId(table.crTableId);
    if (!id) continue;
    const anchor = { type: 'CR:TBL', id, questionId: question.id } as AnchorSpec;
    console.log('[ANCHOR] collect - table question anchor detected', {
      questionId: question.id,
      anchorId: id,
      titre: question.titre,
    });
    anchors.push(anchor);
  }
  console.log('[ANCHOR] collect - total anchors', anchors.length);
  return anchors;
}

export function formatAnchor(spec: Pick<AnchorSpec, 'id' | 'type'>): string {
  return `[[${spec.type}|id=${spec.id}]]`;
}

export function buildConstraintBlock(anchors: AnchorSpec[]): string {
  if (anchors.length === 0) return '';
  const lines = anchors.map((anchor) => `- \`${formatAnchor(anchor)}\``);
  return [
    'CONTRAINTES DE SORTIE',
    '1) Écriture descriptive et factuelle.',
    '2) Pour chaque tableau à insérer, écris l’ancre EXACTEMENT telle quelle, seule sur sa ligne, entourée de backticks.',
    '3) N’écris pas le contenu du tableau, uniquement l’ancre.',
    '4) N’ajoute aucune ancre non listée.',
    '',
    'TABLES À INSÉRER',
    ...lines,
  ].join('\n');
}

export function injectPrompt(baseInstructions: string, anchors: AnchorSpec[]): string {
  if (!anchors.length) return baseInstructions;
  const block = buildConstraintBlock(anchors);
  console.log('[ANCHOR] injectPrompt - injecting constraint block', {
    anchors: anchors.map((a) => a.id),
  });
  return `${block}\n\n${baseInstructions}`.trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function verify(text: string, anchors: AnchorSpec[]): { ok: boolean; missing: string[] } {
  if (anchors.length === 0) {
    return { ok: true, missing: [] };
  }
  const missing: string[] = [];
  for (const anchor of anchors) {
    const marker = `\`${formatAnchor(anchor)}\``;
    const pattern = new RegExp(`^\s*${escapeRegExp(marker)}\s*$`, 'm');
    if (!pattern.test(text)) {
      console.log('[ANCHOR] verify - anchor missing', anchor.id);
      missing.push(anchor.id);
    }
  }
  console.log('[ANCHOR] verify - summary', {
    total: anchors.length,
    missing,
  });
  return { ok: missing.length === 0, missing };
}

export function fixMissing(text: string, _anchors: AnchorSpec[], missingIds: string[]): string {
  // TODO: implémenter un reprompt ciblé si nécessaire. Pour l’instant, on renvoie le texte tel quel.
  if (missingIds.length === 0) return text;
  return text;
}

export const AnchorService = {
  collect,
  formatAnchor,
  buildConstraintBlock,
  injectPrompt,
  verify,
  fixMissing,
};

export type { AnchorSpec as AnchorSpecification };
