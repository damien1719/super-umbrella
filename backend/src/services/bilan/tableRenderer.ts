import type { AnchorSpecification } from '../ai/anchor.service';
import type { Question } from '../../utils/answersMarkdown';

export type RenderContext = {
  anchor: AnchorSpecification;
  questions: Question[];
  answers: Record<string, unknown>;
};

type TableAnswers = Record<string, unknown> & { commentaire?: string };

type LexicalNode = Record<string, unknown>;

type ColumnDef = {
  id: string;
  label: string;
  valueType?: string;
};

type RowDef = {
  id: string;
  label: string;
};

type SurveyTable = {
  columns?: ColumnDef[];
  rowsGroups?: { rows: RowDef[] }[];
  commentaire?: boolean;
  crInsert?: boolean;
  crTableId?: string;
};

function isTableQuestion(question: Question): question is Question & { tableau: SurveyTable } {
  return question?.type === 'tableau' && typeof (question as any)?.tableau === 'object';
}

function createTextNode(text: string): LexicalNode {
  return {
    type: 'text',
    text,
    detail: 0,
    format: 0,
    style: '',
    version: 1,
  };
}

function createParagraph(text: string): LexicalNode {
  return {
    type: 'paragraph',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: text ? [createTextNode(text)] : [],
  };
}

function createTableCell(text: string, opts?: { header?: boolean }): LexicalNode {
  return {
    type: 'tablecell',
    format: '',
    indent: 0,
    version: 1,
    width: null,
    height: null,
    backgroundColor: null,
    colSpan: 1,
    rowSpan: 1,
    headerState: opts?.header ? 1 : 0,
    children: [createParagraph(text)],
  };
}

function createTableRow(cells: LexicalNode[]): LexicalNode {
  return {
    type: 'tablerow',
    format: '',
    indent: 0,
    version: 1,
    height: null,
    children: cells,
  };
}

function isNonEmpty(value: unknown, column?: ColumnDef): boolean {
  if (column?.valueType === 'bool') return value === true || value === false;
  if (column?.valueType === 'multi-choice' || column?.valueType === 'multi-choice-row')
    return Array.isArray(value) && value.length > 0;
  if (typeof value === 'number') return true;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'boolean') return value === true;
  return false;
}

function formatCell(value: unknown, column?: ColumnDef): string {
  if (column?.valueType === 'bool') return value === true ? (column.label ?? 'Oui') : value === false ? 'Non' : '';
  if (column?.valueType === 'multi-choice' || column?.valueType === 'multi-choice-row')
    return Array.isArray(value) ? (value as string[]).join(', ') : '';
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Oui' : '';
  return '';
}

function findQuestion(questions: Question[], anchor: AnchorSpecification): (Question & { tableau: SurveyTable }) | null {
  const question = questions.find((q) => q.id === anchor.questionId);
  if (!question || !isTableQuestion(question) || !question.tableau?.crInsert) return null;
  return question as Question & { tableau: SurveyTable };
}

function extractRows(table: SurveyTable): RowDef[] {
  return table.rowsGroups?.flatMap((group) => group.rows || []) ?? [];
}

export const TableRenderer = {
  renderLexical({ anchor, questions, answers }: RenderContext): LexicalNode[] {
    console.log('[ANCHOR] TableRenderer.renderLexical - start', {
      anchorId: anchor.id,
      questionId: anchor.questionId,
      questionsCount: questions.length,
    });
    const question = findQuestion(questions, anchor);
    if (!question) return [];
    const table = question.tableau ?? {};
    const columns = table.columns ?? [];
    const allRows = extractRows(table);
    const answer = (answers?.[question.id] as TableAnswers) || {};

    const keptColumns = columns.filter((column) =>
      allRows.some((row) => {
        const rowData = (answer?.[row.id] as Record<string, unknown> | undefined) ?? undefined;
        const value = rowData?.[column.id];
        return isNonEmpty(value, column);
      }),
    );

    const rowsToRender = allRows.filter((row) => {
      const rowData = (answer?.[row.id] as Record<string, unknown> | undefined) ?? undefined;
      return keptColumns.some((column) => isNonEmpty(rowData?.[column.id], column));
    });

    const hasContent = rowsToRender.length > 0;
    const comment = typeof answer.commentaire === 'string' ? answer.commentaire.trim() : '';

    if (!hasContent && !comment) {
      console.log('[ANCHOR] TableRenderer.renderLexical - no user content for anchor', {
        anchorId: anchor.id,
        questionId: anchor.questionId,
      });
      // Pas de données exploitables : ne rien insérer (on gardera l'info via anchorsStatus).
      return [];
    }

    const tableRows: LexicalNode[] = [];
    if (keptColumns.length > 0) {
      const headerCells = [createTableCell(question.titre, { header: true }), ...keptColumns.map((column) => createTableCell(column.label ?? column.id, { header: true }))];
      tableRows.push(createTableRow(headerCells));

      for (const row of rowsToRender) {
        const rowData = (answer?.[row.id] as Record<string, unknown> | undefined) ?? undefined;
        const cells = [createTableCell(row.label)];
        for (const column of keptColumns) {
          const value = rowData?.[column.id];
          cells.push(createTableCell(formatCell(value, column)));
        }
        tableRows.push(createTableRow(cells));
      }
    }

    const tableNode: LexicalNode = {
      type: 'table',
      format: '',
      indent: 0,
      version: 1,
      width: null,
      children: tableRows,
    };

    const nodes: LexicalNode[] = [];
    if (tableRows.length > 0) {
      // Add an empty paragraph before and after the table to create spacing
      nodes.push(createParagraph(''));
      nodes.push(tableNode);
      nodes.push(createParagraph(''));
    }

    if (comment) {
      nodes.push(createParagraph(`Commentaire : ${comment}`));
    }

    if (nodes.length === 0) {
      // Aucun contenu exploitable : renvoyer un placeholder texte.
      console.log('[ANCHOR] TableRenderer.renderLexical - fallback paragraph', {
        anchorId: anchor.id,
      });
      nodes.push(createParagraph(`Tableau ${anchor.id} sans données disponibles.`));
    }
    
    console.log('[ANCHOR] TableRenderer.renderLexical - rendered nodes', {
      anchorId: anchor.id,
      nodesCount: nodes.length,
    });
    console.log('[ANCHOR] TableRenderer.renderLexical - rendered nodes', {
      anchorId: anchor.id,
      nodesCount: nodes.length,
    });
    if (nodes.length > 0) {
      const firstNode = nodes[0];
      const children = Array.isArray(firstNode?.children)
        ? (firstNode.children as LexicalNode[])
        : [];
      console.log('nodes', children[0]);
    }
    return nodes;
  },
};
