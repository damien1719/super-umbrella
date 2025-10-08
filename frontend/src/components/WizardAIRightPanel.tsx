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
import { useSectionInstance } from './wizard-ia/useSectionInstance';
import { useAutosave } from './wizard-ia/useAutosave';
import { getDraftStore, useDraftStore } from '@/store/draft';

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
    mode?: 'replace' | 'append',
  ) => void;
  onGenerateFromTemplate?: (
    latest?: Answers,
    rawNotes?: string,
    instanceId?: string,
    imageBase64?: string,
    mode?: 'replace' | 'append',
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
  const [editorReady, setEditorReady] = useState(initialStep !== 2);

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

  const activeBilanAnswers =
    (activeBilanSectionId && bilanAnswers[activeBilanSectionId]) || {};

  const handleSelectBilanSection = async (id: string) => {
    // Flush current draft before switching section
    try {
      if (notesMode === 'manual' && activeBilanSectionId) {
        const currentDraftKey = { bilanId, sectionId: activeBilanSectionId };
        const currentAnswers =
          getDraftStore(currentDraftKey).getState().answers;
        await bilanTypeInstance.save(currentAnswers, {
          sectionId: activeBilanSectionId,
        });
        bilanTypeMarkSaved(currentAnswers);
      }
    } catch {}
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

  // Section instance hooks
  const sectionInstance = useSectionInstance({
    bilanId,
    sectionId: mode === 'section' ? selectedTrame?.value : activeBilanSectionId,
    token,
  });
  // Separate instance accessor for bilanType to flush current on switch cleanly
  const bilanTypeInstance = useSectionInstance({
    bilanId,
    sectionId: activeBilanSectionId,
    token,
  });

  // Draft keys and draft answers for autosave
  const sectionDraftKey = useMemo(
    () => ({ bilanId, sectionId: sectionInfo.id }),
    [bilanId, sectionInfo.id],
  );
  const activeBilanDraftKey = useMemo(
    () => ({
      bilanId,
      sectionId: activeBilanSectionId ?? '__bilan-type__',
    }),
    [bilanId, activeBilanSectionId],
  );
  const sectionDraftAnswers = useDraftStore(sectionDraftKey, (s) => s.answers);
  const bilanDraftAnswers = useDraftStore(
    activeBilanDraftKey,
    (s) => s.answers,
  );

  // Autosave for section mode
  const { markSaved: sectionMarkSaved } = useAutosave<Answers>({
    data: sectionDraftAnswers,
    enabled:
      step === 2 &&
      mode === 'section' &&
      notesMode === 'manual' &&
      !!selectedTrame?.value &&
      editorReady,
    save: (data) => sectionInstance.save(data),
  });
  // Autosave for bilanType mode (active section)
  const { markSaved: bilanTypeMarkSaved } = useAutosave<Answers>({
    data: bilanDraftAnswers,
    enabled:
      step === 2 &&
      mode === 'bilanType' &&
      notesMode === 'manual' &&
      !!activeBilanSectionId &&
      editorReady,
    save: (data) => bilanTypeInstance.save(data),
  });

  // Load latest on entering editor or switching active section, then hydrate draft and mount editor
  const loadLatestInstance = sectionInstance.loadLatest;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (step !== 2) {
        setEditorReady(true);
        return;
      }
      setEditorReady(false);
      try {
        if (mode === 'bilanType') {
          if (!activeBilanSectionId) {
            setEditorReady(true);
            return;
          }
          const latest = await loadLatestInstance();
          const content = latest?.answers ?? {};
          setBilanAnswers((prev) => ({
            ...prev,
            [activeBilanSectionId]: content,
          }));
          dataEntryRef.current?.load?.(content);
          bilanTypeMarkSaved(content);
        } else {
          if (!selectedTrame?.value) {
            setEditorReady(true);
            return;
          }
          const latest = await loadLatestInstance();
          const content = latest?.answers ?? {};
          console.log('content', content);
          onAnswersChange(content);
          dataEntryRef.current?.load?.(content);
          sectionMarkSaved(content);
          console.log('sectionMarkSaved', sectionMarkSaved);
        }
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return;
        console.error('Failed to load latest section instance', e);
      } finally {
        if (!cancelled) setEditorReady(true);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [step, mode, activeBilanSectionId, selectedTrame?.value]);

  const flushCurrent = async () => {
    if (step < 2 || !editorReady) return;
    console.log('flush', notesMode, step);
    try {
      if (mode === 'bilanType' && activeBilanSectionId) {
        const currentDraftKey = { bilanId, sectionId: activeBilanSectionId };
        const currentAnswers =
          getDraftStore(currentDraftKey).getState().answers;
        await sectionInstance.save(currentAnswers, {
          sectionId: activeBilanSectionId,
        });
        bilanTypeMarkSaved(currentAnswers);
      } else if (mode === 'section' && selectedTrame?.value) {
        const currentAnswers =
          getDraftStore(sectionDraftKey).getState().answers;
        await sectionInstance.save(currentAnswers, {
          sectionId: selectedTrame.value,
        });
        sectionMarkSaved(currentAnswers);
      }
    } catch {
      /* ignore */
    }
  };

  const next = async () => {
    await flushCurrent();
    setStep((s) => Math.min(total, s + 1));
  };
  const prev = async () => {
    await flushCurrent();
    setStep((s) => Math.max(1, s - 1));
  };

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
        ? 'Etape 1 : Choisissez ou créez une trame pour votre rédaction'
        : 'Etape 1 : Choisissez ou créez une partie'
      : mode === 'bilanType'
        ? 'Etape 2 : Ajoutez les données anonymisées du patient'
        : 'Etape 2 : Ajoutez les données anonymisées du patient';

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
          sectionIdToEdit={selectedTrame?.value}
        />
      );
    }
  }

  const handleClose = async () => {
    await flushCurrent();
    onCancel();
  };

  // Centralized current-generation handler so it can be called from UI and external events
  const triggerGenerateCurrentWithMode = async (mode: 'replace' | 'append') => {
    console.log('[DEBUG] WizardAIRightPanel - triggerGenerateCurrent');
    const isTemplateMode =
      !!selectedTrame?.templateRefId && !!onGenerateFromTemplate;
    const currentAnswers: Answers =
      notesMode === 'manual'
        ? mode === 'bilanType'
          ? getDraftStore({
              bilanId,
              sectionId: activeBilanSectionId!,
            }).getState().answers
          : getDraftStore(sectionDraftKey).getState().answers
        : {};

    if (isTemplateMode) {
      // Flush to get latest instance id
      const id = await sectionInstance.save(currentAnswers);
      if (notesMode === 'manual') {
        if (mode === 'bilanType') {
          bilanTypeMarkSaved(currentAnswers);
        } else {
          sectionMarkSaved(currentAnswers);
        }
      }
      onGenerateFromTemplate?.(
        notesMode === 'manual' ? currentAnswers : undefined,
        rawNotes,
        id || undefined,
        imageBase64,
        mode,
      );
      onCancel();
    } else {
      await sectionInstance.save(currentAnswers);
      if (notesMode === 'manual') {
        if (mode === 'bilanType') {
          bilanTypeMarkSaved(currentAnswers);
        } else {
          sectionMarkSaved(currentAnswers);
        }
      }
      onGenerate(
        notesMode === 'manual' ? currentAnswers : undefined,
        rawNotes,
        imageBase64,
        mode,
      );
      // Close the wizard after direct generation to keep UX consistent
      onCancel();
    }
  };
  const triggerGenerateCurrent = async () =>
    triggerGenerateCurrentWithMode('replace');
  const triggerGenerateCurrentAppend = async () =>
    triggerGenerateCurrentWithMode('append');

  // Batch generation across all tests (sections) for bilanType mode
  const triggerGenerateAll = async () => {
    if (mode !== 'bilanType') return;
    console.log('[DEBUG] WizardAIRightPanel - triggerGenerateAll');
    // Flush current active section answers first if in manual mode
    await flushCurrent();
    // Prefer delegating to wrapper via onGenerateAll
    if (onGenerateAll && selectedTrame?.value) {
      onGenerateAll(selectedTrame.value, excludedSectionIds);
      return;
    }
    // Fallback legacy behavior: call onGenerate sequentially without additional fetches
    const sectionItems = navItems.filter((x) => x.kind !== 'separator');
    for (const sec of sectionItems as Array<{ id: string; title: string }>) {
      if (excludedSectionIds.includes(sec.id)) continue;
      const answersForSec = bilanAnswers[sec.id] || {};
      const isTemplateMode =
        !!selectedTrame?.templateRefId && !!onGenerateFromTemplate;
      try {
        if (isTemplateMode) {
          await onGenerateFromTemplate?.(
            notesMode === 'manual' ? answersForSec : undefined,
            rawNotes,
            undefined,
            imageBase64,
          );
        } else {
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
      void flushCurrent();
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
      <div className="px-4 pt-4 pb-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            {headerTitle}
          </DialogTitle>
          {/*           <DialogDescription className="text-lg text-gray-600">
            {headerDescription}
          </DialogDescription> */}
        </DialogHeader>
      </div>

      {/* Row 2 — Scrollable content */}
      <div className={'flex-1 overflow-y-auto px-4 min-h-0'}>
        {step === 2 && !editorReady ? (
          <div className="text-sm text-gray-500 py-8">Chargement…</div>
        ) : (
          content
        )}
      </div>

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
                    onClick={triggerGenerateCurrentAppend}
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
                        Générer et insérer à la suite
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={triggerGenerateCurrent}
                    disabled={isGenerating}
                    type="button"
                    variant="outline"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-5 w-5 mr-2" />
                        Générer et remplacer le contenu
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
