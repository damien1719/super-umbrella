import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ExitConfirmation from './ExitConfirmation';
import { Loader2, Wand2, X } from 'lucide-react';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/store/auth';
import { useUserProfileStore } from '@/store/userProfile';
import { kindMap } from '@/types/trame';
import type { TrameOption, TrameExample } from './bilan/TrameSelector';
import type { DataEntryHandle } from './bilan/DataEntry';
import type { Answers, Question } from '@/types/question';
import type { SectionInfo } from './bilan/SectionCard';
import { useBilanTypeStore } from '@/store/bilanTypes';
import { useSectionStore } from '@/store/sections';
import {
  useBilanGeneration,
  useBilanGenerationRegistrar,
} from './wizard-ai/useBilanGeneration';
import { TrameSelectionStep } from './wizard-ai/TrameSelectionStep';
import { BilanTypeNotesEditor } from './wizard-ai/BilanTypeNotesEditor';
import { SectionNotesEditor } from './wizard-ai/SectionNotesEditor';

export interface WizardAIRightPanelProps {
  sectionInfo: SectionInfo;
  trameOptions: TrameOption[];
  selectedTrame: TrameOption | undefined;
  onTrameChange: (value: string) => void;
  examples: TrameExample[];
  onAddExample: (ex: Omit<TrameExample, 'id'>) => void;
  onRemoveExample: (id: string) => void;
  questions: Question[];
  answers: Answers;
  onAnswersChange: (a: Answers) => void;
  mode?: 'section' | 'bilanType';
  onGenerate: (
    latest?: Answers,
    rawNotes?: string,
    imageBase64?: string,
  ) => void;
  onGenerateFromTemplate?: (
    latest?: Answers,
    rawNotes?: string,
    instanceId?: string,
    imageBase64?: string,
  ) => void;
  // Optional bulk generation hook used by WizardAIBilanType footer
  onGenerateAll?: (bilanTypeId: string, excludeSectionIds?: string[]) => void;
  isGenerating: boolean;
  bilanId: string;
  onCancel: () => void;
  initialStep?: number;
  step?: number;
  onStepChange?: (step: number) => void;
  activeSectionId?: string | null;
  onActiveSectionChange?: (info: { id: string | null; title: string }) => void;
  excludedSectionIds?: string[];
  onExcludedSectionsChange?: (ids: string[]) => void;
}

export default function WizardAIRightPanel({
  sectionInfo,
  trameOptions,
  selectedTrame,
  onTrameChange,
  questions,
  answers,
  onAnswersChange,
  mode = 'section',
  onGenerate,
  onGenerateFromTemplate,
  onGenerateAll,
  isGenerating,
  bilanId,
  onCancel,
  initialStep = 1,
  step: externalStep,
  onStepChange,
  activeSectionId,
  onActiveSectionChange,
  excludedSectionIds: externalExcludedSectionIds,
  onExcludedSectionsChange,
}: WizardAIRightPanelProps) {
  const [internalStep, setInternalStep] = useState(initialStep);
  const dataEntryRef = useRef<DataEntryHandle>(null);
  const navigate = useNavigate();
  const total = 2;

  const isStepControlled = externalStep !== undefined;
  const currentStep = isStepControlled
    ? (externalStep as number)
    : internalStep;

  useEffect(() => {
    if (!isStepControlled) {
      setInternalStep(initialStep);
    }
  }, [initialStep, isStepControlled]);

  useEffect(() => {
    if (isStepControlled && externalStep !== undefined) {
      setInternalStep(externalStep);
    }
  }, [externalStep, isStepControlled]);

  const updateStep = useCallback(
    (next: number) => {
      if (!isStepControlled) {
        setInternalStep(next);
      }
      onStepChange?.(next);
    },
    [isStepControlled, onStepChange],
  );
  const token = useAuth((s) => s.token);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  // Le profil est chargé au niveau de l'application (App.tsx layouts)
  // Ici on se contente de le consommer pour filtrer les trames
  const { profile } = useUserProfileStore();
  const profileId = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profile?.id ?? (profile as any)?.id ?? null,
    [profile],
  );

  const [notesMode, setNotesMode] = useState<'manual' | 'import'>('manual');
  const [rawNotes, setRawNotes] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);

  // Debug: log when imageBase64 changes
  useEffect(() => {
    console.log('[DEBUG] WizardAIRightPanel - imageBase64 state changed:', {
      hasImage: !!imageBase64,
      imageLength: imageBase64?.length || 0,
      preview: imageBase64?.substring(0, 100) + '...' || 'none',
    });
  }, [imageBase64]);

  // Ne pas refetch ici pour éviter les doublons (StrictMode double les effets en dev)
  // Le chargement initial du profil est géré dans App.tsx

  const isSharedWithMe = (s: {
    isPublic?: boolean;
    authorId?: string | null;
  }) => {
    // Heuristic: returned by backend because shared (private, not mine)
    return s.isPublic === false && !!profileId && s.authorId !== profileId;
  };
  const myTrames = trameOptions.filter(
    (s) => (!!profileId && s.authorId === profileId) || isSharedWithMe(s),
  );
  const officialTrames = trameOptions.filter((s) => s.source === 'BILANPLUME');
  const communityTrames = trameOptions.filter(
    (s) => s.isPublic && s.source !== 'BILANPLUME',
  );

  const [activeTab, setActiveTab] = useState<'mine' | 'official' | 'community'>(
    myTrames.length > 0
      ? 'mine'
      : officialTrames.length > 0
        ? 'official'
        : 'community',
  );

  // BilanType-specific state and helpers
  const { items: bilanTypes } = useBilanTypeStore();
  const { items: allSections } = useSectionStore();
  const currentBilanType = useMemo(
    () =>
      mode === 'bilanType' && selectedTrame
        ? bilanTypes.find((b) => b.id === selectedTrame.value)
        : undefined,
    [mode, selectedTrame, bilanTypes],
  );
  const navItems = useMemo(() => {
    if (mode !== 'bilanType' || !currentBilanType)
      return [] as Array<{
        id: string;
        title: string;
        kind?: 'section' | 'separator';
        index?: number;
        schema?: Question[];
      }>;
    const layout = currentBilanType.layoutJson as any;
    const tokens: Array<{ t: 'sep' | 'sec'; id?: string; title?: string }> = [];
    try {
      const root = layout?.root;
      const children = Array.isArray(root?.children) ? root.children : [];
      for (const node of children) {
        if (node?.type === 'heading') {
          // Extract heading plain text
          const text = Array.isArray(node.children)
            ? node.children
                .map((c: any) => (typeof c?.text === 'string' ? c.text : ''))
                .join('')
            : '';
          if (text) tokens.push({ t: 'sep', title: text });
        } else if (
          node?.type === 'section-placeholder' &&
          typeof node?.sectionId === 'string'
        ) {
          tokens.push({ t: 'sec', id: node.sectionId });
        }
      }
    } catch {}

    const items: Array<{
      id: string;
      title: string;
      kind?: 'section' | 'separator';
      index?: number;
      schema?: Question[];
    }> = [];
    let idx = 0;
    if (tokens.length > 0) {
      for (let i = 0; i < tokens.length; i++) {
        const tk = tokens[i];
        if (tk.t === 'sep' && tk.title) {
          items.push({ id: `__sep__${i}`, title: tk.title, kind: 'separator' });
        } else if (tk.t === 'sec' && tk.id) {
          const sec = allSections.find((x) => x.id === tk.id);
          items.push({
            id: tk.id,
            title: (sec?.title as string) || `Section ${idx + 1}`,
            kind: 'section',
            index: idx,
            schema: ((sec?.schema || []) as unknown as Question[]) || [],
          });
          idx += 1;
        }
      }
      return items;
    }

    // Fallback to simple section list using sortOrder
    const map = currentBilanType.sections || [];
    return map
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((s, index) => {
        const sec = allSections.find((x) => x.id === s.sectionId);
        return {
          id: s.sectionId,
          title: (sec?.title as string) || `Section ${index + 1}`,
          kind: 'section' as const,
          index,
          schema: ((sec?.schema || []) as unknown as Question[]) || [],
        };
      });
  }, [mode, currentBilanType, allSections]);

  const [internalActiveSectionId, setInternalActiveSectionId] = useState<
    string | null
  >(null);
  const [bilanAnswers, setBilanAnswers] = useState<Record<string, Answers>>({});
  const [internalExcludedSectionIds, setInternalExcludedSectionIds] = useState<
    string[]
  >([]);

  const isActiveSectionControlled = activeSectionId !== undefined;
  const activeBilanSectionId = isActiveSectionControlled
    ? (activeSectionId ?? null)
    : internalActiveSectionId;

  const isExcludedControlled = externalExcludedSectionIds !== undefined;
  const excludedSectionIds = isExcludedControlled
    ? (externalExcludedSectionIds ?? [])
    : internalExcludedSectionIds;

  useEffect(() => {
    if (isExcludedControlled) {
      setInternalExcludedSectionIds(externalExcludedSectionIds ?? []);
    }
  }, [externalExcludedSectionIds, isExcludedControlled]);

  useEffect(() => {
    if (mode !== 'bilanType') return;
    const firstSec = navItems.find((x) => x.kind !== 'separator');
    if (!activeBilanSectionId && firstSec) {
      if (isActiveSectionControlled) {
        onActiveSectionChange?.({ id: firstSec.id, title: firstSec.title });
      } else {
        setInternalActiveSectionId(firstSec.id);
      }
    }
  }, [
    mode,
    navItems,
    activeBilanSectionId,
    isActiveSectionControlled,
    onActiveSectionChange,
  ]);

  const lastActiveInfoRef = useRef<{ id: string | null; title: string }>({
    id: null,
    title: '',
  });

  const emitActiveSectionChange = useCallback(
    (nextId: string | null) => {
      if (mode !== 'bilanType') return;
      const active = navItems.find(
        (s) => s.id === nextId && s.kind !== 'separator',
      );
      const detail: { id: string | null; title: string } = active
        ? { id: active.id, title: active.title }
        : { id: null, title: '' };
      if (
        detail.id !== lastActiveInfoRef.current.id ||
        detail.title !== lastActiveInfoRef.current.title
      ) {
        onActiveSectionChange?.(detail);
        lastActiveInfoRef.current = detail;
      }
    },
    [mode, navItems, onActiveSectionChange],
  );

  const setActiveSection = useCallback(
    (nextId: string | null) => {
      if (!isActiveSectionControlled) {
        setInternalActiveSectionId(nextId);
      }
      emitActiveSectionChange(nextId);
    },
    [emitActiveSectionChange, isActiveSectionControlled],
  );

  useEffect(() => {
    emitActiveSectionChange(activeBilanSectionId ?? null);
  }, [emitActiveSectionChange, activeBilanSectionId]);

  const updateExcludedSections = useCallback(
    (updater: (prev: string[]) => string[]) => {
      setInternalExcludedSectionIds((prev) => {
        const base = isExcludedControlled
          ? (externalExcludedSectionIds ?? [])
          : prev;
        const next = updater(base);
        if (!isExcludedControlled) {
          return next;
        }
        return base;
      });
      const base = isExcludedControlled
        ? (externalExcludedSectionIds ?? [])
        : internalExcludedSectionIds;
      const next = updater(base);
      onExcludedSectionsChange?.(next);
    },
    [
      externalExcludedSectionIds,
      internalExcludedSectionIds,
      isExcludedControlled,
      onExcludedSectionsChange,
    ],
  );

  const [isManualSaving, setIsManualSaving] = useState(false);

  const saveNotes = useCallback(
    async (
      notes: Answers | undefined,
      targetOverrideId?: string | null,
    ): Promise<string | null> => {
      const targetSectionId =
        targetOverrideId ??
        (mode === 'bilanType' ? activeBilanSectionId : selectedTrame?.value);
      if (!targetSectionId) return null;

      // Debug: trace d'où vient l'appel upsert
      console.trace('[DEBUG] saveNotes called - Stack trace:');
      console.log('[DEBUG] saveNotes - notes:', notes);
      console.log('[DEBUG] saveNotes - selectedTrame:', selectedTrame?.value);
      console.log('[DEBUG] saveNotes - targetSectionId:', targetSectionId);
      console.log('[DEBUG] saveNotes - isManualSaving:', isManualSaving);

      setIsManualSaving(true);
      try {
        const res = await apiFetch<{ id: string }>(
          `/api/v1/bilan-section-instances/upsert`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              bilanId,
              sectionId: targetSectionId,
              contentNotes: notes,
            }),
          },
        );
        setInstanceId(res.id);
        return res.id;
      } finally {
        // Délai pour éviter que l'autosave se déclenche immédiatement après
        setTimeout(() => setIsManualSaving(false), 1500);
      }
    },
    [mode, activeBilanSectionId, selectedTrame, isManualSaving, bilanId, token],
  );

  const handleSelectBilanSection = useCallback(
    (id: string) => {
      if (notesMode === 'manual' && activeBilanSectionId) {
        try {
          const data = dataEntryRef.current?.save() as Answers | undefined;
          if (data) void saveNotes(data, activeBilanSectionId);
        } catch {}
      }
      setActiveSection(id);
      const next = bilanAnswers[id];
      if (next) dataEntryRef.current?.load?.(next);
    },
    [
      notesMode,
      activeBilanSectionId,
      saveNotes,
      setActiveSection,
      bilanAnswers,
    ],
  );

  // Preload latest notes when entering step 2
  useEffect(() => {
    if (currentStep !== 2) return;
    if (mode === 'bilanType') {
      if (!activeBilanSectionId) return;
      (async () => {
        try {
          const res = await apiFetch<
            Array<{ id: string; contentNotes: Answers }>
          >(
            `/api/v1/bilan-section-instances?bilanId=${bilanId}&sectionId=${activeBilanSectionId}&latest=true`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (res.length) {
            setInstanceId(res[0].id);
            const content = (res[0].contentNotes || {}) as Answers;
            setBilanAnswers((prev) => ({
              ...prev,
              [activeBilanSectionId]: content,
            }));
            dataEntryRef.current?.load?.(content);
          } else {
            setInstanceId(null);
            setBilanAnswers((prev) => ({
              ...prev,
              [activeBilanSectionId]: {},
            }));
            dataEntryRef.current?.clear?.();
          }
        } catch (e) {
          console.error('Failed to load latest section instance', e);
        }
      })();
    } else {
      if (!selectedTrame) return;
      (async () => {
        try {
          const res = await apiFetch<
            Array<{ id: string; contentNotes: Answers }>
          >(
            `/api/v1/bilan-section-instances?bilanId=${bilanId}&sectionId=${selectedTrame.value}&latest=true`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (res.length) {
            setInstanceId(res[0].id);
            // preload answers both in parent state and DataEntry local state
            onAnswersChange(res[0].contentNotes as Answers);
            dataEntryRef.current?.load?.(res[0].contentNotes as Answers);
          } else {
            setInstanceId(null);
            onAnswersChange({});
            dataEntryRef.current?.clear?.();
          }
        } catch (e) {
          console.error('Failed to load latest section instance', e);
        }
      })();
    }
  }, [currentStep, selectedTrame, bilanId, token, mode, activeBilanSectionId]);

  const next = () => updateStep(Math.min(total, currentStep + 1));
  const prev = () => updateStep(Math.max(1, currentStep - 1));

  const stepTitles =
    mode === 'bilanType'
      ? [
          'Trame',
          "Ecrivez vos notes brutes ou saisissez les résultats de vos observations: c'est la matière brute utilisée par l'IA pour rédiger",
        ]
      : [
          'Partie',
          "Ecrivez vos notes brutes ou saisissez les résultats de vos observations: c'est la matière brute utilisée par l'IA pour rédiger",
        ];

  const headerTitle =
    currentStep === 1
      ? mode === 'bilanType'
        ? 'Choisissez ou créez une trame pour votre rédaction'
        : 'Choisissez ou créez une partie'
      : mode === 'bilanType'
        ? 'Ajoutez les données anonymisées du patient'
        : 'Ajoutez les données anonymisées du patient';

  const headerDescription = `Étape ${currentStep}/${total} – ${stepTitles[currentStep - 1]}`;

  let content: React.JSX.Element | null = null;

  if (currentStep === 1) {
    content = (
      <TrameSelectionStep
        mode={mode}
        selectedTrame={selectedTrame}
        onTrameChange={onTrameChange}
        collections={{
          mine: myTrames,
          official: officialTrames,
          community: communityTrames,
        }}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        trameKind={kindMap[sectionInfo.id]}
        onCreateTrame={(id) =>
          navigate(`/creation-trame/${id}`, {
            state: {
              returnTo: `/bilan/${bilanId}`,
              wizardSection: sectionInfo.id,
            },
          })
        }
      />
    );
  } else if (mode === 'bilanType') {
    const activeAnswers =
      (activeBilanSectionId && bilanAnswers[activeBilanSectionId]) || {};
    content = (
      <BilanTypeNotesEditor
        navItems={navItems}
        activeSectionId={activeBilanSectionId}
        onSelectSection={handleSelectBilanSection}
        excludedSectionIds={excludedSectionIds}
        onToggleExcluded={(id) =>
          updateExcludedSections((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
          )
        }
        dataEntryRef={dataEntryRef}
        answers={activeAnswers}
        onAnswersChange={(a) => {
          if (!activeBilanSectionId) return;
          setBilanAnswers((prev) => ({
            ...prev,
            [activeBilanSectionId]: a,
          }));
        }}
        notesMode={notesMode}
        onNotesModeChange={setNotesMode}
        onRawNotesChange={setRawNotes}
        onImageChange={setImageBase64}
      />
    );
  } else {
    content = (
      <SectionNotesEditor
        sectionTitle={sectionInfo.title}
        questions={questions}
        answers={answers}
        onAnswersChange={onAnswersChange}
        dataEntryRef={dataEntryRef}
        notesMode={notesMode}
        onNotesModeChange={setNotesMode}
        onRawNotesChange={setRawNotes}
        onImageChange={setImageBase64}
      />
    );
  }

  const getCurrentAnswers = useCallback((): Answers => {
    if (notesMode === 'manual') {
      return (dataEntryRef.current?.save() as Answers) || {};
    }
    if (mode === 'bilanType') {
      return (activeBilanSectionId && bilanAnswers[activeBilanSectionId]) || {};
    }
    return answers;
  }, [notesMode, mode, activeBilanSectionId, bilanAnswers, answers]);

  const getSectionAnswers = useCallback(
    (sectionId: string): Answers => {
      return bilanAnswers[sectionId] || {};
    },
    [bilanAnswers],
  );

  const generationRegistrar = useBilanGenerationRegistrar();
  const generationControls = useBilanGeneration({
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
  });

  const { generateCurrent, generateAll, isGeneratingCurrent } =
    generationControls;

  useEffect(() => {
    generationRegistrar(generationControls);
  }, [generationRegistrar, generationControls]);

  // Autosave on answers change (debounced) while on step 2
  const lastSavedRef = useRef<string>('');
  useEffect(() => {
    if (currentStep !== 2 || isManualSaving) return;
    const currentAns =
      mode === 'bilanType'
        ? activeBilanSectionId
          ? bilanAnswers[activeBilanSectionId]
          : {}
        : answers;
    const payload = JSON.stringify(currentAns ?? {});
    if (payload === lastSavedRef.current) return;
    const t = setTimeout(() => {
      (async () => {
        try {
          await saveNotes(currentAns);
          lastSavedRef.current = payload;
        } catch {
          // ignore autosave errors silently
        }
      })();
    }, 1000);
    return () => clearTimeout(t);
  }, [
    answers,
    bilanAnswers,
    activeBilanSectionId,
    mode,
    currentStep,
    isManualSaving,
    saveNotes,
  ]);

  // Reset autosave sentinel when switching active section
  useEffect(() => {
    lastSavedRef.current = '';
  }, [activeBilanSectionId]);

  useEffect(() => {
    if (currentStep !== 2 || isManualSaving) return;
    const interval = setInterval(() => {
      const data = dataEntryRef.current?.save() as Answers | undefined;
      if (data) {
        saveNotes(data).catch(() => {
          /* ignore error */
        });
      }
    }, 20000); // 20s

    return () => clearInterval(interval);
  }, [currentStep, selectedTrame, isManualSaving, saveNotes]);

  const handleClose = async () => {
    if (currentStep === 2 && selectedTrame && !isManualSaving) {
      //const data = dataEntryRef.current?.save() as Answers | undefined;
      try {
        /*         await saveNotes(data);
         */
      } catch {
        /* ignore/option: toast */
      }
    }
    onCancel();
  };

  // External event listeners from wrapper (WizardAIBilanType)
  useEffect(() => {
    const onGenSelected = () => void generateCurrent();
    const onGenAll = () => void generateAll();
    const onSaveCurrent = () => {
      try {
        const data =
          notesMode === 'manual'
            ? (dataEntryRef.current?.save() as Answers)
            : undefined;
        if (data) void saveNotes(data);
      } catch {}
    };
    window.addEventListener('bilan-type:generate-selected', onGenSelected);
    window.addEventListener('bilan-type:generate-all', onGenAll);
    window.addEventListener('bilan-type:save-current', onSaveCurrent);
    return () => {
      window.removeEventListener('bilan-type:generate-selected', onGenSelected);
      window.removeEventListener('bilan-type:generate-all', onGenAll);
      window.removeEventListener('bilan-type:save-current', onSaveCurrent);
    };
  }, [notesMode, saveNotes, generateCurrent, generateAll]);

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Close button stays absolute over everything */}
      <button
        type="button"
        className="absolute top-2 right-2 z-30 p-1 rounded hover:bg-gray-100"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </button>

      <ExitConfirmation
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={onCancel}
        onCancel={handleClose}
      />

      {/* Row 1 — Header */}
      <div className="px-4 pt-4 pb-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            {headerTitle}
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600">
            {headerDescription}
          </DialogDescription>
        </DialogHeader>
      </div>

      {/* Row 2 — Scrollable content */}
      <div className={'flex-1 overflow-y-auto px-4 min-h-0'}>{content}</div>

      {/* Row 3 — Footer glued to bottom (hidden at step 2 in bilanType mode to avoid duplicate footers) */}
      {!(mode === 'bilanType' && currentStep === total) && (
        <div className="px-4">
          <div
            className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70
                        border-t border-gray-200 shadow-[0_-1px_0_0_rgba(0,0,0,0.04)]
                        py-3"
          >
            <div className="flex items-center justify-between">
              {currentStep > 1 ? (
                <Button variant="secondary" onClick={prev} type="button">
                  Précédent
                </Button>
              ) : (
                <span />
              )}

              {currentStep < total ? (
                <Button onClick={next} type="button" size="lg">
                  Étape suivante
                </Button>
              ) : mode === 'bilanType' ? (
                // When used inside WizardAIBilanType, its footer provides
                // the generation controls. Avoid duplicate buttons here.
                <div />
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => void generateCurrent()}
                    disabled={isGenerating || isGeneratingCurrent}
                    type="button"
                  >
                    {isGenerating || isGeneratingCurrent ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-5 w-5 mr-2" />
                        Générer
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
