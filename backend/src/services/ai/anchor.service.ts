import type { Question } from '../../utils/answersMarkdown';

export type TableAnchorSpec = {
  type: 'CR:TBL';
  id: string;
  questionId: string;
};

export type TitlePresetAnchorSpec = {
  type: 'CR:TITLE_PRESET';
  id: string;
  questionId: string;
  presetId: string;
};

export type AnchorSpec = TableAnchorSpec | TitlePresetAnchorSpec;

function isTableQuestion(question: Question): question is Question & { tableau: { crInsert?: boolean; crTableId?: string } } {
  return question?.type === 'tableau' && typeof (question as any)?.tableau === 'object' && (question as any)?.tableau !== null;
}

function normalizeId(raw: string): string {
  return raw.trim();
}

function hasTitlePreset(question: Question): question is Question & { titrePresetId: string } {
  const preset = (question as any)?.titrePresetId;
  return typeof preset === 'string' && preset.trim().length > 0;
}

export function collect(questions: Question[] | null | undefined): AnchorSpec[] {
  if (!Array.isArray(questions)) return [];
  const anchors: AnchorSpec[] = [];
  for (const question of questions) {
    if (isTableQuestion(question)) {
      const table = (question as any).tableau as { crInsert?: boolean; crTableId?: string };
      if (table?.crInsert && typeof table.crTableId === 'string') {
        const id = normalizeId(table.crTableId);
        if (id) {
          const anchor: TableAnchorSpec = { type: 'CR:TBL', id, questionId: question.id };
          console.log('[ANCHOR] collect - table question anchor detected', {
            questionId: question.id,
            anchorId: id,
            titre: question.titre,
          });
          anchors.push(anchor);
        }
      }
    }

    if (hasTitlePreset(question)) {
      const presetId = normalizeId((question as any).titrePresetId as string);
      const anchorId = normalizeId(question.id);
      if (presetId && anchorId) {
        const anchor: TitlePresetAnchorSpec = {
          type: 'CR:TITLE_PRESET',
          id: anchorId,
          questionId: question.id,
          presetId,
        };
        console.log('[ANCHOR] collect - title preset anchor detected', {
          questionId: question.id,
          anchorId,
          presetId,
          titre: question.titre,
        });
        anchors.push(anchor);
      }
    }
  }
  console.log('[ANCHOR] collect - total anchors', {
    total: anchors.length,
    byType: anchors.reduce<Record<string, number>>((acc, anchor) => {
      acc[anchor.type] = (acc[anchor.type] ?? 0) + 1;
      return acc;
    }, {}),
  });
  return anchors;
}

export function formatAnchor(spec: Pick<AnchorSpec, 'id' | 'type'>): string {
  return `[[${spec.type}|id=${spec.id}]]`;
}

export function buildConstraintBlock(anchors: AnchorSpec[]): string {
  if (anchors.length === 0) return '';
  const tableAnchors = anchors.filter((anchor): anchor is TableAnchorSpec => anchor.type === 'CR:TBL');
  const titleAnchors = anchors.filter(
    (anchor): anchor is TitlePresetAnchorSpec => anchor.type === 'CR:TITLE_PRESET',
  );

  const instructions: string[] = [
    'CONTRAINTES DE SORTIE',
    '1) Reproduis les ancres listées ci-dessous EXACTEMENT telles quelles, seules sur leur ligne et entourées de backticks.',
  ];

  let ruleIndex = 2;
  if (tableAnchors.length > 0) {
    instructions.push(
      `${ruleIndex}) Pour les tableaux, n’écris pas leur contenu : insère uniquement l’ancre correspondante.`,
    );
    ruleIndex += 1;
  }
  if (titleAnchors.length > 0) {
    instructions.push(
      `${ruleIndex}) Pour les titres, ajoute l'ancre sans écrire le titre.`,
    );
    ruleIndex += 1;
  }
  instructions.push(`${ruleIndex}) N’ajoute aucune ancre non listée.`);

  const blocks: string[] = [...instructions, ''];

  if (tableAnchors.length > 0) {
    blocks.push('TABLES À INSÉRER');
    blocks.push(...tableAnchors.map((anchor) => `- \`${formatAnchor(anchor)}\``));
    if (titleAnchors.length > 0) {
      blocks.push('');
    }
  }

  if (titleAnchors.length > 0) {
    blocks.push('TITRES À MARQUER');
    blocks.push(
      ...titleAnchors.map(
        (anchor) => `- \`${formatAnchor(anchor)}\``,
      ),
    );
  }

  return blocks.join('\n');
}

export function injectPrompt(baseInstructions: string, anchors: AnchorSpec[]): string {
  if (anchors.length === 0) return baseInstructions;
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
