// Backend-only markdownification matching frontend/services/generation.ts behavior

type ValueType =
  | 'bool'
  | 'number'
  | 'text'
  | 'choice'
  | 'multi-choice'
  | 'multi-choice-row'
  | 'image';

export type TitleAlign = 'left' | 'center' | 'right' | 'justify';
export type TitleCase = 'none' | 'uppercase' | 'capitalize' | 'lowercase';
export type TitleKind = 'heading' | 'paragraph' | 'list-item';

export type DecorWeight = 'none' | 'thin' | 'medium' | 'thick' | 'dashed';
export type DecorFillKind = 'none' | 'token' | 'custom';
export type DecorFillToken =
  | 'red' | 'orange' | 'yellow' | 'green' | 'emerald' | 'blue' | 'indigo' | 'violet' | 'pink' | 'gray';

export interface TitleDecorSpec {
  weight?: DecorWeight;                  // défaut: 'thin'
  color?: string;                        // 'black' | 'gray' | '#RRGGBB'…
  // Optionnel: remplissage de fond, aligne-toi à ton DecorBlockNode
  fill?: {
    kind: DecorFillKind;                 // 'none' | 'token' | 'custom'
    token?: DecorFillToken;              // si kind='token'
    color?: string;                      // si kind='custom' (#RRGGBB)
  };
}

export type TitleFormatSpec = {
  kind: TitleKind;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  align?: TitleAlign;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  case?: TitleCase;
  fontSize?: string | number;
  // Couleur de police optionnelle. Exemple: 'black' | 'gray' | '#RRGGBB'
  fontColor?: string;
  runs?: Array<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  }>;
  prefix?: string;
  suffix?: string;
  decor?: TitleDecorSpec;
};

type ColumnDef = {
  id: string;
  label: string;
  valueType: ValueType;
  options?: string[];
  rowOptions?: Record<string, string[]>;
};

type Row = {
  id: string;
  label: string;
};

type RowsGroup = {
  id: string;
  title: string;
  rows: Row[];
};

type SurveyTable = {
  columns: ColumnDef[];
  rowsGroups: RowsGroup[];
  commentaire?: boolean;
  crInsert?: boolean;
  crTableId?: string;
};

export type Question = {
  id: string;
  type: 'notes' | 'choix-multiple' | 'echelle' | 'tableau' | 'titre';
  titre: string;
  options?: string[];
  commentaire?: boolean;
  echelle?: { min: number; max: number; labels?: { min: string; max: string } };
  tableau?: SurveyTable;
  titrePresetId?: string;
  titreFormatOverride?: TitleFormatSpec;
};

type Answers = Record<string, unknown>;
type TableAnswers = Record<string, unknown> & { commentaire?: string };

const TABLE_ANCHOR_TYPE = 'CR:TBL';
const TITLE_PRESET_ANCHOR_TYPE = 'CR:TITLE_PRESET';

function formatAnchor(type: string, id: string): string {
  const normalized = id.trim();
  return normalized ? '`[[' + type + '|id=' + normalized + ']]`' : '';
}

function formatTableAnchor(id: string): string {
  return formatAnchor(TABLE_ANCHOR_TYPE, id);
}

function formatTitlePresetAnchor(id: string): string {
  return formatAnchor(TITLE_PRESET_ANCHOR_TYPE, id);
}

function markdownifyTable(q: Question, ansTable: TableAnswers): string {
  if (!q.tableau?.columns) return '';
  const columns = q.tableau.columns;
  const allRows = q.tableau.rowsGroups?.flatMap((rg) => rg.rows) || [];

  const isNonEmpty = (v: unknown, col?: { valueType?: string }) => {
    if (col?.valueType === 'bool') return v === true || v === false;
    if (col?.valueType === 'multi-choice' || col?.valueType === 'multi-choice-row')
      return Array.isArray(v) && v.length > 0;
    if (typeof v === 'number') return true;
    if (typeof v === 'string') return String(v).trim() !== '';
    if (typeof v === 'boolean') return v === true;
    return false;
  };

  const formatCell = (v: unknown, col?: { valueType?: string; label?: string }) => {
    if (col?.valueType === 'bool') return v === true ? (col.label ?? 'true') : '';
    if (col?.valueType === 'multi-choice' || col?.valueType === 'multi-choice-row')
      return Array.isArray(v) ? (v as string[]).join(', ') : '';
    if (v == null) return '';
    if (typeof v === 'string') return String(v).trim();
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'true' : '';
    return '';
  };

  const keptColumns = columns.filter((col) =>
    allRows.some((row) => {
      const rowData = ansTable[row.id] as Record<string, unknown> | undefined;
      const v = rowData?.[col.id];
      return isNonEmpty(v, col);
    }),
  );

  const titleLine = `**${q.titre}**\n\n`;

  let tablePart = '';
  if (keptColumns.length > 0) {
    const headerLine = `| ${['Ligne', ...keptColumns.map((c) => c.label)].join(' | ')} |`;
    const sepLine = `| ${['---', ...keptColumns.map(() => '---')].join(' | ')} |`;
    const bodyLines = allRows
      .filter((row) => {
        const rowData = ansTable[row.id] as Record<string, unknown> | undefined;
        return keptColumns.some((col) => isNonEmpty(rowData?.[col.id], col));
      })
      .map((row) => {
        const rowData = ansTable[row.id] as Record<string, unknown> | undefined;
        const cells = keptColumns.map((col) => formatCell(rowData?.[col.id], col));
        return `| ${[row.label, ...cells].join(' | ')} |`;
      })
      .join('\n');
    tablePart = `${headerLine}\n${sepLine}\n${bodyLines}`;
  }

  const commentVal = ansTable.commentaire;
  const comment =
    typeof commentVal === 'string' && commentVal.trim() !== ''
      ? `\n\n> **Commentaire** : ${commentVal}`
      : '';

  if (tablePart.trim() === '' && comment.trim() === '') return '';
  if (tablePart.trim() === '') return titleLine + comment;
  return titleLine + tablePart + comment;
}

function markdownifyField(q: Question, value: unknown): string {
  switch (q.type) {
    case 'notes':
      return `${q.titre}: ${value ?? ''}`;
    case 'choix-multiple': {
      if (value && typeof value === 'object') {
        const selectedOptions = Array.isArray((value as any).options)
          ? (value as any).options.join(', ')
          : (value as any).option
            ? String((value as any).option)
            : '';
        const comment = (value as any).commentaire || '';
        return `${q.titre}: ${selectedOptions}${
          comment ? `\n\n> **Commentaire** : ${comment}` : ''
        }`;
      }
      return `${q.titre}: ${value ?? ''}`;
    }
    case 'echelle':
      return `${q.titre}: ${value ?? ''}`;
    case 'titre':
      return `### ${q.titre}: ${value ?? ''}`;
    default:
      return `${q.titre}: ${value ?? ''}`;
  }
}

export function answersToMdBlocks(questions: Question[], ans: Answers): string[] {
  const mdBlocks: string[] = [];
  for (const q of questions || []) {
    if (q.type === 'tableau') {
      const table = q.tableau;
      if (table?.crInsert) {
        const anchorId = typeof table.crTableId === 'string' ? table.crTableId.trim() : '';
        if (anchorId) {
          mdBlocks.push(formatTableAnchor(anchorId));
          continue;
        }
      }
      const ansTable = (ans?.[q.id] as TableAnswers) || {};
      const md = markdownifyTable(q, ansTable);
      if (md.trim()) mdBlocks.push(md);
    } else if (q.type === 'titre') {
      if (typeof q.titrePresetId === 'string' && q.titrePresetId.trim() !== '') {
        const anchor = formatTitlePresetAnchor(q.id);
        if (anchor) {
          mdBlocks.push(anchor);
          continue;
        }
      }
      mdBlocks.push(markdownifyField(q, ''));
    } else {
      const val = (ans as any)?.[q.id];
      if (val !== undefined && val !== null) {
        if (typeof val === 'object') {
          const hasContent = Object.values(val as Record<string, unknown>).some(
            (v) => String(v || '').trim() !== '',
          );
          if (hasContent) mdBlocks.push(markdownifyField(q, val));
        } else {
          const raw = String(val).trim();
          if (raw) mdBlocks.push(markdownifyField(q, raw));
        }
      }
    }
  }
  return mdBlocks;
}

export function answersToMarkdown(questions: Question[], ans: Answers): string {
  return answersToMdBlocks(questions, ans).join('\n\n');
}
