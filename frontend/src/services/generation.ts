import { apiFetch } from '@/utils/api';
import { splitBlocksIntoStringChunks } from '@/lib/chunkAnswers';
import type { Question, Answers } from '@/types/question';
import type { SectionInfo } from '@/components/bilan/SectionCard';

type TableAnswers = Record<string, unknown> & { commentaire?: string };

export type GenerationMode = 'direct' | 'template';

export type GenerationResult =
  | { type: 'text'; text: string }
  | { type: 'lexical'; state: unknown };

function getStylePrompt(
  trameId: string | undefined,
  examples: Array<{ sectionId: string; stylePrompt?: string }>,
) {
  return examples
    .filter((e) => e.sectionId === trameId)
    .map((e) => (e as any).stylePrompt)
    .filter((s) => typeof s === 'string' && (s as string).trim().length > 0)
    .slice(0, 1)[0];
}

function markdownifyTable(q: Question, ansTable: TableAnswers): string {
  if (!q.tableau?.columns) {
    return '';
  }

  const columns = q.tableau.columns;
  const allRows = q.tableau.rowsGroups?.flatMap((rg) => rg.rows) || [];

  const isNonEmpty = (v: unknown, col?: { valueType?: string }) => {
    if (col?.valueType === 'bool') return v === true;
    if (typeof v === 'number') return true;
    if (typeof v === 'string') return (v as string).trim() !== '';
    if (typeof v === 'boolean') return v === true;
    return false;
  };

  const formatCell = (v: unknown, col?: { valueType?: string }) => {
    if (col?.valueType === 'bool') return v === true ? '✓' : '';
    if (v == null) return '';
    if (typeof v === 'string') return (v as string).trim();
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? '✓' : '';
    return '';
  };

  const keptColumns = columns.filter((col) =>
    allRows.some((row) => {
      const rowData = ansTable[row.id] as Record<string, unknown> | undefined;
      const v = rowData?.[col.id];
      return isNonEmpty(v);
    }),
  );

  const titleLine = `**${q.titre}**\n\n`;

  let tablePart = '';
  if (keptColumns.length > 0) {
    const headerLine = `| ${['Ligne', ...keptColumns.map((c) => c.label)].join(' | ')} |`;
    const sepLine = `| ${['---', ...keptColumns.map(() => '---')].join(' | ')} |`;
    const bodyLines = allRows
      .map((row) => {
        const rowData = ansTable[row.id] as Record<string, unknown> | undefined;
        const cells = keptColumns.map((col) =>
          formatCell(rowData?.[col.id], col),
        );
        return `| ${[row.label, ...cells].join(' | ')} |`;
      })
      .join('\n');
    tablePart = `${headerLine}\n${sepLine}\n${bodyLines}`;
  }

  const commentVal = ansTable.commentaire;
  const comment =
    typeof commentVal === 'string' && (commentVal as string).trim() !== ''
      ? `\n\n> **Commentaire** : ${commentVal}`
      : '';

  if (tablePart.trim() === '' && comment.trim() === '') return '';
  if (tablePart.trim() === '') return titleLine + comment;
  return titleLine + tablePart + comment;
}

function markdownifyField(q: Question, value: unknown): string {
  switch (q.type) {
    case 'notes':
      return `${q.titre}\n\n${value ?? ''}`;
    case 'choix-multiple':
      if (value && typeof value === 'object') {
        const selectedOptions = Array.isArray((value as any).options)
          ? (value as any).options.join(', ')
          : (value as any).option
            ? String((value as any).option)
            : '';
        const comment = (value as any).commentaire || '';
        return `${q.titre}\n\n${selectedOptions}${
          comment ? `\n\n> **Commentaire** : ${comment}` : ''
        }`;
      }
      return `${q.titre}\n\n${value ?? ''}`;
    case 'echelle':
      return `${q.titre}\n\n${value ?? ''}`;
    case 'titre':
      return `## ${q.titre}\n\n${value ?? ''}`;
    default:
      return `${q.titre} : ${value ?? ''}`;
  }
}

function markdownifyAnswers(
  questions: Question[],
  ans: Answers,
): { mdBlocks: string[]; promptMarkdown: string; chunks: string[] } {
  const mdBlocks: string[] = [];

  for (const q of questions) {
    if (q.type === 'tableau') {
      const ansTable = (ans[q.id] as TableAnswers) || {};
      const md = markdownifyTable(q, ansTable);
      if (md.trim()) mdBlocks.push(md);
    } else if (q.type === 'titre') {
      mdBlocks.push(markdownifyField(q, ''));
    } else {
      const val = (ans as any)[q.id];
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

  const promptMarkdown = mdBlocks.join('\n\n');
  const chunks = splitBlocksIntoStringChunks(mdBlocks, { maxChars: 1800 });
  return { mdBlocks, promptMarkdown, chunks };
}

async function doRequestDirect(params: {
  token: string;
  bilanId: string;
  sectionKind: string;
  chunks: string[];
  stylePrompt?: string;
  rawNotes?: string;
  imageBase64?: string;
}): Promise<GenerationResult> {
  const body: any = {
    section: params.sectionKind,
    answers: params.chunks,
    stylePrompt: params.stylePrompt,
  };
  if (params.rawNotes?.trim()) body.rawNotes = params.rawNotes;
  if (params.imageBase64) body.imageBase64 = params.imageBase64;

  const res = await apiFetch<{ text: string }>(
    `/api/v1/bilans/${params.bilanId}/generate`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${params.token}` },
      body: JSON.stringify(body),
    },
  );

  return { type: 'text', text: res.text };
}

async function doRequestFromTemplate(params: {
  token: string;
  instanceId: string;
  trameId: string;
  chunks: string[];
  stylePrompt?: string;
  contentNotes?: Answers;
  rawNotes?: string;
  imageBase64?: string;
}): Promise<GenerationResult> {
  console.log('[DEBUG] doRequestFromTemplate - Starting request with params:');
  console.log('[DEBUG] doRequestFromTemplate - instanceId:', params.instanceId);
  console.log('[DEBUG] doRequestFromTemplate - trameId:', params.trameId);
  console.log(
    '[DEBUG] doRequestFromTemplate - chunks count:',
    params.chunks.length,
  );
  console.log(
    '[DEBUG] doRequestFromTemplate - chunks preview:',
    params.chunks.slice(0, 2),
  );
  console.log(
    '[DEBUG] doRequestFromTemplate - has stylePrompt:',
    !!params.stylePrompt,
  );
  console.log(
    '[DEBUG] doRequestFromTemplate - has contentNotes:',
    !!params.contentNotes,
  );
  console.log(
    '[DEBUG] doRequestFromTemplate - has rawNotes:',
    !!params.rawNotes,
  );
  console.log(
    '[DEBUG] doRequestFromTemplate - contentNotes keys:',
    Object.keys(params.contentNotes || {}),
  );
  console.log(
    '[DEBUG] doRequestFromTemplate - rawNotes length:',
    params.rawNotes?.length || 0,
  );

  const body: any = {
    instanceId: params.instanceId,
    trameId: params.trameId,
    answers: params.chunks,
    stylePrompt: params.stylePrompt,
    contentNotes: params.contentNotes,
    rawNotes: params.rawNotes,
  };
  if (params.imageBase64) body.imageBase64 = params.imageBase64;

  console.log('[DEBUG] doRequestFromTemplate - Request body prepared:', {
    hasInstanceId: !!body.instanceId,
    hasTrameId: !!body.trameId,
    answersCount: body.answers?.length || 0,
    hasStylePrompt: !!body.stylePrompt,
    hasContentNotes: !!body.contentNotes,
    hasRawNotes: !!body.rawNotes,
  });

  console.log(
    '[DEBUG] doRequestFromTemplate - Making API call to generate-from-template...',
  );

  const res = await apiFetch<{ assembledState: unknown }>(
    `/api/v1/bilan-section-instances/generate-from-template`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${params.token}` },
      body: JSON.stringify(body),
    },
  );

  console.log('[DEBUG] doRequestFromTemplate - API response received:');
  console.log('[DEBUG] doRequestFromTemplate - Response type:', typeof res);
  console.log(
    '[DEBUG] doRequestFromTemplate - Has assembledState:',
    !!res.assembledState,
  );
  console.log(
    '[DEBUG] doRequestFromTemplate - AssembledState type:',
    typeof res.assembledState,
  );
  console.log(
    '[DEBUG] doRequestFromTemplate - AssembledState length:',
    typeof res.assembledState === 'string' ? res.assembledState.length : 'N/A',
  );
  console.log(
    '[DEBUG] doRequestFromTemplate - AssembledState preview:',
    typeof res.assembledState === 'string'
      ? res.assembledState.slice(0, 300)
      : JSON.stringify(res.assembledState).slice(0, 300),
  );

  const result = { type: 'lexical' as const, state: res.assembledState };

  console.log('[DEBUG] doRequestFromTemplate - Returning result:', {
    type: result.type,
    hasState: !!result.state,
    stateType: typeof result.state,
  });

  return result;
}

export async function generateSection(opts: {
  mode: GenerationMode;
  section: SectionInfo;
  trames: Record<string, Array<{ value: string; schema: Question[] }>>;
  selectedTrames: Record<string, string>;
  answers: Record<string, Answers>;
  newAnswers?: Answers;
  rawNotes?: string;
  imageBase64?: string;
  instanceId?: string;

  token: string;
  bilanId: string;
  kindMap: Record<string, string>;

  setIsGenerating: (b: boolean) => void;
  setSelectedSection: (id: string | null) => void;
  setWizardSection?: (id: string | null) => void;
  setGenerated?: (
    fn: (prev: Record<string, boolean>) => Record<string, boolean>,
  ) => void;
  setRegenSection?: (id: string | null) => void;
  setRegenPrompt?: (s: string) => void;
  onInsertText?: (text: string) => void;
  onSetEditorStateJson?: (state: unknown) => void;

  examples: Array<{ sectionId: string; stylePrompt?: string }>;
}) {
  const {
    mode,
    section,
    trames,
    selectedTrames,
    answers,
    newAnswers,
    rawNotes,
    imageBase64,
    instanceId,

    token,
    bilanId,
    kindMap,

    setIsGenerating,
    setSelectedSection,
    setWizardSection,
    setGenerated,
    setRegenSection,
    setRegenPrompt,
    onInsertText,
    onSetEditorStateJson,

    examples,
  } = opts;

  setIsGenerating(true);
  setSelectedSection(section.id);

  try {
    const trameId = selectedTrames[section.id];
    const trame = trames[section.id]?.find((t) => t.value === trameId);
    const questions: Question[] = (trame?.schema as Question[]) || [];
    const current = newAnswers || answers[section.id] || {};

    const { promptMarkdown, chunks } = markdownifyAnswers(questions, current);
    const stylePrompt = getStylePrompt(trameId, examples);
    const sectionKind = kindMap[section.id];

    let result: GenerationResult;

    if (mode === 'direct') {
      result = await doRequestDirect({
        token,
        bilanId,
        sectionKind,
        chunks,
        stylePrompt,
        rawNotes,
        imageBase64,
      });
    } else {
      if (!instanceId) throw new Error('Missing instanceId for template mode');
      console.log(
        '[DEBUG] generateSection - About to call doRequestFromTemplate with:',
        {
          token: '***token***',
          instanceId,
          trameId,
          chunksCount: chunks.length,
          stylePrompt: stylePrompt ? '***stylePrompt***' : null,
          contentNotes: current,
          rawNotes,
        },
      );
      result = await doRequestFromTemplate({
        token,
        instanceId,
        trameId,
        chunks,
        stylePrompt,
        contentNotes: current,
        rawNotes,
        imageBase64,
      });
      console.log(
        '[DEBUG] generateSection - doRequestFromTemplate result:',
        result,
      );
    }

    if (result.type === 'text') {
      const header = `## ${section.title}\n\n`;
      onInsertText?.(header + result.text);
      setGenerated?.((g) => ({ ...g, [section.id]: true }));
      setRegenSection?.(section.id);
      setRegenPrompt?.('');
    } else if (result.type === 'lexical') {
      console.log(
        '[DEBUG] Generation - Received lexical result - START processing',
      );
      console.log(
        '[DEBUG] Generation - Result state type:',
        typeof result.state,
      );
      console.log(
        '[DEBUG] Generation - Result state is null/undefined:',
        result.state == null,
      );
      console.log(
        '[DEBUG] Generation - Result state length:',
        typeof result.state === 'string' ? result.state.length : 'N/A',
      );
      console.log(
        '[DEBUG] Generation - Result state preview:',
        typeof result.state === 'string'
          ? result.state.slice(0, 300)
          : JSON.stringify(result.state).slice(0, 300),
      );

      // Additional detailed logging for lexical state
      if (typeof result.state === 'object' && result.state !== null) {
        console.log(
          '[DEBUG] Generation - Lexical state is object with keys:',
          Object.keys(result.state),
        );
        console.log(
          '[DEBUG] Generation - Lexical state has root:',
          !!(result.state as any).root,
        );
        console.log(
          '[DEBUG] Generation - Lexical state has version:',
          (result.state as any).version !== undefined,
        );
      }

      console.log('[DEBUG] Generation - onSetEditorStateJson availability:', {
        exists: !!onSetEditorStateJson,
        isFunction: typeof onSetEditorStateJson === 'function',
      });

      if (onSetEditorStateJson) {
        console.log(
          '[DEBUG] Generation - onSetEditorStateJson is available, preparing to call it',
        );
        console.log(
          '[DEBUG] Generation - About to call onSetEditorStateJson with state:',
          {
            hasState: !!result.state,
            stateType: typeof result.state,
            stateSize:
              typeof result.state === 'string' ? result.state.length : 'N/A',
          },
        );

        try {
          onSetEditorStateJson(result.state);
          console.log(
            '[DEBUG] Generation - onSetEditorStateJson called successfully - EDITOR STATE UPDATED',
          );
        } catch (error) {
          console.error(
            '[DEBUG] Generation - ERROR calling onSetEditorStateJson:',
            error,
          );
          console.error('[DEBUG] Generation - Error details:', {
            error: error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
          });
        }
      } else {
        console.log(
          '[DEBUG] Generation - onSetEditorStateJson is NOT available, using fallback custom event',
        );
        console.log('[DEBUG] Generation - Creating custom event with state:', {
          hasState: !!result.state,
          stateType: typeof result.state,
        });

        const event = new CustomEvent('lexical:set-json', {
          detail: result.state,
        });

        console.log('[DEBUG] Generation - Dispatching custom event...');
        window.dispatchEvent(event);
        console.log(
          '[DEBUG] Generation - Custom event dispatched successfully',
        );

        // Listen for potential errors in event handling
        setTimeout(() => {
          console.log(
            '[DEBUG] Generation - Checking if custom event was handled (5s after dispatch)',
          );
        }, 5000);
      }

      console.log('[DEBUG] Generation - Lexical result processing completed');
    }
  } finally {
    setIsGenerating(false);
    setSelectedSection(null);
    setWizardSection?.(null);
  }
}
