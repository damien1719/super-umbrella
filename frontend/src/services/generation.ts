/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { apiFetch } from '@/utils/api';
import type { Question, Answers } from '@/types/question';
import type { SectionInfo } from '@/components/bilan/SectionCard';

export type GenerationResult = { type: 'lexical'; state: unknown };

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

async function requestGenerate(params: {
  token: string;
  bilanId: string;
  sectionId: string;
  instanceId?: string;
  answers?: Answers;
  stylePrompt?: string;
  rawNotes?: string;
  imageBase64?: string;
}): Promise<GenerationResult> {
  const body: any = {
    sectionId: params.sectionId,
  };
  if (params.instanceId) body.instanceId = params.instanceId;
  if (!params.instanceId && params.answers) body.answers = params.answers;
  if (params.stylePrompt) body.stylePrompt = params.stylePrompt;
  if (params.rawNotes?.trim()) body.rawNotes = params.rawNotes;
  if (params.imageBase64) body.imageBase64 = params.imageBase64;

  const res = await apiFetch<{ assembledState: unknown }>(
    `/api/v1/bilans/${params.bilanId}/generate`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${params.token}` },
      body: JSON.stringify(body),
    },
  );
  return { type: 'lexical', state: res.assembledState };
}

export async function generateSection(opts: {
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

  setIsGenerating: (b: boolean) => void;
  setSelectedSection: (id: string | null) => void;
  setWizardSection?: (id: string | null) => void;
  setGenerated?: (
    fn: (prev: Record<string, boolean>) => Record<string, boolean>,
  ) => void;
  setRegenSection?: (id: string | null) => void;
  setRegenPrompt?: (s: string) => void;
  onSetEditorStateJson?: (state: unknown) => void;

  examples: Array<{ sectionId: string; stylePrompt?: string }>;
}) {
  const {
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

    setIsGenerating,
    setSelectedSection,
    setWizardSection,
    setGenerated,
    setRegenSection,
    setRegenPrompt,
    onSetEditorStateJson,

    examples,
  } = opts;

  setIsGenerating(true);
  setSelectedSection(section.id);

  try {
    const trameId = selectedTrames[section.id];
    const trame = trames[section.id]?.find((t) => t.value === trameId);
    const questions: Question[] = (trame?.schema as Question[]) || [];
    const current: Answers = (newAnswers ??
      answers[section.id] ??
      {}) as Answers;

    const stylePrompt = getStylePrompt(trameId, examples);

    let result: GenerationResult;

    result = await requestGenerate({
      token,
      bilanId,
      sectionId: trameId,
      instanceId,
      // Only send answers when not using a template instance
      answers: instanceId ? undefined : current,
      stylePrompt,
      rawNotes,
      imageBase64,
    });

    if (result.type !== 'lexical') {
      console.warn('[DEBUG] Generation - Unexpected result type', result);
      return;
    }

    console.log(
      '[DEBUG] Generation - Received lexical result - START processing',
    );
    console.log('[DEBUG] Generation - Result state type:', typeof result.state);
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
      console.log('[DEBUG] Generation - Custom event dispatched successfully');

      setTimeout(() => {
        console.log(
          '[DEBUG] Generation - Checking if custom event was handled (5s after dispatch)',
        );
      }, 5000);
    }

    setGenerated?.((g) => ({ ...g, [section.id]: true }));
    console.log('[DEBUG] Generation - Lexical result processing completed');
  } finally {
    setIsGenerating(false);
    setSelectedSection(null);
    setWizardSection?.(null);
  }
}
