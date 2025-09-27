import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Answers } from '@/types/question';
import type { TrameOption } from '../bilan/TrameSelector';
import type { NavItem } from './BilanTypeNotesEditor';

type GenerateFn = () => Promise<void>;

type Mode = 'section' | 'bilanType';
type NotesMode = 'manual' | 'import';
	export interface BilanGenerationControls {
  generateCurrent: GenerateFn;
  generateAll: GenerateFn;
  isGeneratingCurrent: boolean;
  isGeneratingAll: boolean;
  isBusy: boolean;
  canGenerateAll: boolean;
}

type RegisterFn = (controls: BilanGenerationControls) => void;

const noopAsync: GenerateFn = () => Promise.resolve();

export const DEFAULT_GENERATION_CONTROLS: BilanGenerationControls = {
  generateCurrent: noopAsync,
  generateAll: noopAsync,
  isGeneratingCurrent: false,
  isGeneratingAll: false,
  isBusy: false,
  canGenerateAll: false,
};

const GenerationStateContext = createContext<BilanGenerationControls>(
  DEFAULT_GENERATION_CONTROLS,
);
const GenerationRegisterContext = createContext<RegisterFn>(() => {});

export function BilanGenerationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [controls, setControls] = useState<BilanGenerationControls>(
    DEFAULT_GENERATION_CONTROLS,
  );

  const register = useCallback((next: BilanGenerationControls) => {
    setControls(next);
  }, []);

  return (
    <GenerationRegisterContext.Provider value={register}>
      <GenerationStateContext.Provider value={controls}>
        {children}
      </GenerationStateContext.Provider>
    </GenerationRegisterContext.Provider>
  );
}

export function useBilanGenerationContext(): BilanGenerationControls {
  return useContext(GenerationStateContext);
}

export function useBilanGenerationRegistrar(): RegisterFn {
  return useContext(GenerationRegisterContext);
}

export interface UseBilanGenerationOptions {
  mode: Mode;
  notesMode: NotesMode;
  selectedTrame?: TrameOption;
  navItems: NavItem[];
  excludedSectionIds: string[];
  rawNotes: string;
  imageBase64?: string;
  onGenerate: (
    latest?: Answers,
    rawNotes?: string,
    imageBase64?: string,
  ) => void | Promise<void>;
  onGenerateFromTemplate?: (
    latest?: Answers,
    rawNotes?: string,
    instanceId?: string,
    imageBase64?: string,
  ) => void | Promise<void>;
  onGenerateAll?: (bilanTypeId: string, excludedSectionIds?: string[]) =>
    | void
    | Promise<void>;
  getCurrentAnswers: () => Answers;
  getSectionAnswers: (sectionId: string) => Answers;
  saveNotes: (
    notes: Answers | undefined,
    targetOverrideId?: string | null,
  ) => Promise<string | null>;
  onCancel: () => void;
}

export function useBilanGeneration({
  mode,
  notesMode,
  selectedTrame,
  navItems,
  excludedSectionIds,
  rawNotes,
  imageBase64,
  onGenerate,
  onGenerateFromTemplate,
  onGenerateAll,
  getCurrentAnswers,
  getSectionAnswers,
  saveNotes,
  onCancel,
}: UseBilanGenerationOptions): BilanGenerationControls {
  const [isGeneratingCurrent, setIsGeneratingCurrent] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const shouldUseManualAnswers = notesMode === 'manual';

  const runCurrentGeneration = useCallback(
    async (answers: Answers, instanceId: string | null) => {
      const manualPayload = shouldUseManualAnswers ? answers : undefined;
      const isTemplate =
        !!selectedTrame?.templateRefId && !!onGenerateFromTemplate;

      if (isTemplate) {
        await onGenerateFromTemplate?.(
          manualPayload,
          rawNotes,
          instanceId ?? undefined,
          imageBase64,
        );
      } else {
        await onGenerate(manualPayload, rawNotes, imageBase64);
      }
    },
    [
      shouldUseManualAnswers,
      selectedTrame?.templateRefId,
      onGenerateFromTemplate,
      rawNotes,
      imageBase64,
      onGenerate,
    ],
  );

  const generateCurrent = useCallback(async () => {
    if (isGeneratingCurrent) return;
    setIsGeneratingCurrent(true);
    try {
      const answers = getCurrentAnswers();
      const persistencePayload = shouldUseManualAnswers ? answers : {};
      const instanceId = await saveNotes(persistencePayload);
      await runCurrentGeneration(answers, instanceId);
      onCancel();
    } finally {
      setIsGeneratingCurrent(false);
    }
  }, [
    getCurrentAnswers,
    isGeneratingCurrent,
    onCancel,
    runCurrentGeneration,
    saveNotes,
    shouldUseManualAnswers,
  ]);

  const generateAll = useCallback(async () => {
    if (mode !== 'bilanType' || isGeneratingAll) return;
    setIsGeneratingAll(true);
    try {
      const currentAnswers = getCurrentAnswers();
      const currentPersistence = shouldUseManualAnswers ? currentAnswers : {};
      await saveNotes(currentPersistence);

      if (onGenerateAll && selectedTrame?.value) {
        await onGenerateAll(selectedTrame.value, excludedSectionIds);
        return;
      }

      const sections = navItems.filter((item) => item.kind !== 'separator');

      for (const section of sections) {
        if (excludedSectionIds.includes(section.id)) continue;

        const answers = getSectionAnswers(section.id) || {};
        const persistencePayload = shouldUseManualAnswers ? answers : {};
        const instanceId = await saveNotes(persistencePayload, section.id);
        await runCurrentGeneration(answers, instanceId);
      }
    } finally {
      setIsGeneratingAll(false);
    }
  }, [
    excludedSectionIds,
    getCurrentAnswers,
    getSectionAnswers,
    isGeneratingAll,
    mode,
    navItems,
    onGenerateAll,
    runCurrentGeneration,
    saveNotes,
    selectedTrame?.value,
    shouldUseManualAnswers,
  ]);

  return useMemo(
    () => ({
      generateCurrent,
      generateAll,
      isGeneratingCurrent,
      isGeneratingAll,
      isBusy: isGeneratingCurrent || isGeneratingAll,
      canGenerateAll: mode === 'bilanType',
    }),
    [
      generateAll,
      generateCurrent,
      isGeneratingAll,
      isGeneratingCurrent,
      mode,
    ],
  );
}
