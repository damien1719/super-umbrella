import { useState, useRef, useEffect, useMemo } from 'react';
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
import { TrameSelectionStep } from './wizard-ia/TrameSectionStep';
import { BilanTypeNotesEditor } from './wizard-ia/BilanTypeNotesEditor';
import { SectionNotesEditor } from './wizard-ia/SectionNotesEditor';

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
  isGenerating,
  bilanId,
  onCancel,
  initialStep = 1,
}: WizardAIRightPanelProps) {
  const [step, setStep] = useState(initialStep);
  const dataEntryRef = useRef<DataEntryHandle>(null);
  const navigate = useNavigate();
  const total = 2;
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

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

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

  const [activeBilanSectionId, setActiveBilanSectionId] = useState<
    string | null
  >(null);
  const [bilanAnswers, setBilanAnswers] = useState<Record<string, Answers>>({});
  const [excludedSectionIds, setExcludedSectionIds] = useState<string[]>([]);

  const activeBilanDraftKey = useMemo(
    () => ({
      bilanId,
      sectionId: activeBilanSectionId ?? '__bilan-type__',
    }),
    [bilanId, activeBilanSectionId],
  );

  const activeBilanAnswers =
    (activeBilanSectionId && bilanAnswers[activeBilanSectionId]) || {};

  const handleSelectBilanSection = (id: string) => {
    if (notesMode === 'manual' && activeBilanSectionId) {
      try {
        const data = dataEntryRef.current?.save() as Answers | undefined;
        if (data) void saveNotes(data, activeBilanSectionId);
      } catch {}
    }
    setActiveBilanSectionId(id);
  };

  const handleToggleExcluded = (id: string) => {
    setExcludedSectionIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        const evt = new CustomEvent('bilan-type:excluded-changed', {
          detail: next,
        });
        window.dispatchEvent(evt);
      } catch {}
      return next;
    });
  };

  const handleBilanAnswersChange = (a: Answers) => {
    if (!activeBilanSectionId) return;
    setBilanAnswers((prev) => ({
      ...prev,
      [activeBilanSectionId]: a,
    }));
  };

  useEffect(() => {
    if (mode !== 'bilanType') return;
    const firstSec = navItems.find((x) => x.kind !== 'separator');
    if (!activeBilanSectionId && firstSec) {
      setActiveBilanSectionId(firstSec.id);
    }
  }, [mode, navItems, activeBilanSectionId]);

  // Notify outer wrapper of active section changes (for footer label)
  useEffect(() => {
    if (mode !== 'bilanType') return;
    const active = navItems.find(
      (s) => s.id === activeBilanSectionId && s.kind !== 'separator',
    );
    const detail = active
      ? { id: active.id, title: active.title }
      : { id: null as unknown as string, title: '' };
    const evt = new CustomEvent('bilan-type:active-changed', { detail });
    window.dispatchEvent(evt);
  }, [mode, activeBilanSectionId, navItems]);

  // Preload latest notes when entering step 2
  useEffect(() => {
    if (step !== 2) return;
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
  }, [step, selectedTrame, bilanId, token, mode, activeBilanSectionId]);

  const next = () => setStep((s) => Math.min(total, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  // Notify wrapper about step changes (used to control outer footer)
  useEffect(() => {
    const evt = new CustomEvent('bilan-type:step-changed', { detail: step });
    window.dispatchEvent(evt);
  }, [step]);

  // Allow wrapper to drive navigation (for aligning footer actions)
  useEffect(() => {
    const onPrev = () => prev();
    window.addEventListener('bilan-type:prev', onPrev);
    return () => window.removeEventListener('bilan-type:prev', onPrev);
  }, []);

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
    step === 1
      ? mode === 'bilanType'
        ? 'Choisissez ou créez une trame pour votre rédaction'
        : 'Choisissez ou créez une partie'
      : mode === 'bilanType'
        ? 'Ajoutez les données anonymisées du patient'
        : 'Ajoutez les données anonymisées du patient';

  const headerDescription = `Étape ${step}/${total} – ${stepTitles[step - 1]}`;

  let content: React.JSX.Element | null = null;

  if (step === 1) {
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
  } else {
    if (mode === 'bilanType') {
      content = (
        <BilanTypeNotesEditor
          navItems={navItems}
          activeSectionId={activeBilanSectionId}
          onSelectSection={handleSelectBilanSection}
          excludedSectionIds={excludedSectionIds}
          onToggleExcluded={handleToggleExcluded}
          dataEntryRef={dataEntryRef}
          answers={activeBilanAnswers}
          onAnswersChange={handleBilanAnswersChange}
          notesMode={notesMode}
          onNotesModeChange={(mode) => setNotesMode(mode)}
          onRawNotesChange={setRawNotes}
          onImageChange={setImageBase64}
          draftKey={activeBilanDraftKey}
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
          onNotesModeChange={(mode) => setNotesMode(mode)}
          onRawNotesChange={setRawNotes}
          onImageChange={setImageBase64}
          draftKey={{ bilanId, sectionId: sectionInfo.id }}
        />
      );
    }
  }

  const [isManualSaving, setIsManualSaving] = useState(false);

  const saveNotes = async (
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
  };

  // Autosave on answers change (debounced) while on step 2
  const lastSavedRef = useRef<string>('');
  useEffect(() => {
    if (step !== 2 || isManualSaving) return;
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
  }, [answers, bilanAnswers, activeBilanSectionId, mode, step, isManualSaving]);

  // Reset autosave sentinel when switching active section
  useEffect(() => {
    lastSavedRef.current = '';
  }, [activeBilanSectionId]);

  useEffect(() => {
    if (step !== 2 || isManualSaving) return;
    const interval = setInterval(() => {
      const data = dataEntryRef.current?.save() as Answers | undefined;
      if (data) {
        saveNotes(data).catch(() => {
          /* ignore error */
        });
      }
    }, 20000); // 20s

    return () => clearInterval(interval);
  }, [step, selectedTrame, isManualSaving]);

  // Autosave on unmount (including ESC close via Dialog)
  /*   useEffect(() => {
    return () => {
      try {
        const data = dataEntryRef.current?.save() as Answers | undefined;
        // fire-and-forget
        void saveNotes(data);
      } catch {
        // ignore
      }
    };
  }, []); */

  // Save immediately when user presses ESC (best-effort before Dialog closes)
  /*   useEffect(() => {
    if (step !== 2 || isManualSaving) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        try {
          const data = dataEntryRef.current?.save() as Answers | undefined;
          void saveNotes(data);
        } catch {}
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [step]); */

  const handleClose = async () => {
    if (step === 2 && selectedTrame && !isManualSaving) {
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

  // Centralized current-generation handler so it can be called from UI and external events
  const triggerGenerateCurrent = async () => {
    console.log('[DEBUG] WizardAIRightPanel - triggerGenerateCurrent');
    const isTemplateMode =
      !!selectedTrame?.templateRefId && !!onGenerateFromTemplate;
    const data: Answers =
      notesMode === 'manual'
        ? (dataEntryRef.current?.save() as Answers) || {}
        : {};

    if (isTemplateMode) {
      const id = await saveNotes(data);
      onGenerateFromTemplate?.(
        notesMode === 'manual' ? data : undefined,
        rawNotes,
        id || undefined,
        imageBase64,
      );
      onCancel();
    } else {
      await saveNotes(data);
      onGenerate(
        notesMode === 'manual' ? data : undefined,
        rawNotes,
        imageBase64,
      );
      // Close the wizard after direct generation to keep UX consistent
      onCancel();
    }
  };

  // Batch generation across all tests (sections) for bilanType mode
  const triggerGenerateAll = async () => {
    if (mode !== 'bilanType') return;
    console.log('[DEBUG] WizardAIRightPanel - triggerGenerateAll');
    // Save current active section answers first if in manual mode
    try {
      const currentData: Answers | undefined =
        notesMode === 'manual'
          ? (dataEntryRef.current?.save() as Answers)
          : undefined;
      if (currentData) await saveNotes(currentData).catch(() => {});
    } catch {}

    // Iterate all sections of the selected BilanType
    const sectionItems = navItems.filter((x) => x.kind !== 'separator');
    for (const sec of sectionItems as Array<{
      id: string;
      title: string;
      index?: number;
    }>) {
      if (excludedSectionIds.includes(sec.id)) {
        console.log(
          '[DEBUG] triggerGenerateAll - skipping excluded section',
          sec.id,
        );
        continue;
      }
      try {
        // Load latest instanceId for this section to pass to template generation if supported
        let latestInstanceId: string | undefined = undefined;
        try {
          const res = await apiFetch<
            Array<{ id: string; contentNotes: Answers }>
          >(
            `/api/v1/bilan-section-instances?bilanId=${bilanId}&sectionId=${sec.id}&latest=true`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          latestInstanceId = res[0]?.id;
        } catch (e) {
          console.warn(
            '[DEBUG] triggerGenerateAll - load latest failed for',
            sec.id,
            e,
          );
        }

        const answersForSec = bilanAnswers[sec.id] || {};
        const isTemplateMode =
          !!selectedTrame?.templateRefId && !!onGenerateFromTemplate;

        if (isTemplateMode) {
          // Use per-section instance if available
          await onGenerateFromTemplate?.(
            notesMode === 'manual' ? answersForSec : undefined,
            rawNotes,
            latestInstanceId,
            imageBase64,
          );
        } else {
          console.log('here');
          await onGenerate(
            notesMode === 'manual' ? answersForSec : undefined,
            rawNotes,
            imageBase64,
          );
        }
      } catch (e) {
        console.error(
          '[DEBUG] triggerGenerateAll - error on section',
          sec.id,
          e,
        );
      }
    }
  };

  // External event listeners from wrapper (WizardAIBilanType)
  useEffect(() => {
    const onGenSelected = () => void triggerGenerateCurrent();
    const onGenAll = () => void triggerGenerateAll();
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
  }, [
    notesMode,
    rawNotes,
    imageBase64,
    bilanAnswers,
    navItems,
    selectedTrame,
    onGenerateFromTemplate,
    onGenerate,
    mode,
    token,
    bilanId,
    excludedSectionIds,
  ]);

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
      {!(mode === 'bilanType' && step === total) && (
        <div className="px-4">
          <div
            className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70
                        border-t border-gray-200 shadow-[0_-1px_0_0_rgba(0,0,0,0.04)]
                        py-3"
          >
            <div className="flex items-center justify-between">
              {step > 1 ? (
                <Button variant="secondary" onClick={prev} type="button">
                  Précédent
                </Button>
              ) : (
                <span />
              )}

              {step < total ? (
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
                    onClick={triggerGenerateCurrent}
                    disabled={isGenerating}
                    type="button"
                  >
                    {isGenerating ? (
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
