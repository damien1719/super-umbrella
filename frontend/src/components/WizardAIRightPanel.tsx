import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import TrameCard from './TrameCard';
import CreerTrameModal from './ui/creer-trame-modale';
import ExitConfirmation from './ExitConfirmation';
import { Loader2, Plus, Wand2, X } from 'lucide-react';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/store/auth';
import { Tabs } from '@/components/ui/tabs';
import { useUserProfileStore } from '@/store/userProfile';
import { kindMap } from '@/types/trame';
import type { TrameOption, TrameExample } from './bilan/TrameSelector';
import { DataEntry, type DataEntryHandle } from './bilan/DataEntry';
import ImportNotes from './ImportNotes';
import type { Answers, Question } from '@/types/question';
import type { SectionInfo } from './bilan/SectionCard';
import { useBilanTypeStore } from '@/store/bilanTypes';
import { useSectionStore } from '@/store/sections';
import LeftNavBilanType from './bilan/LeftNavBilanType';

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
  const { profile, fetchProfile } = useUserProfileStore();
  const profileId = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profile?.id ?? (profile as any)?.id ?? null,
    [profile],
  );
  const OFFICIAL_AUTHOR_ID = import.meta.env.VITE_OFFICIAL_AUTHOR_ID;

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

  useEffect(() => {
    fetchProfile().catch(() => {});
  }, [fetchProfile]);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const myTrames = trameOptions.filter(
    (s) => !!profileId && s.authorId === profileId,
  );
  const officialTrames = trameOptions.filter(
    (s) =>
      !!OFFICIAL_AUTHOR_ID && s.isPublic && s.authorId === OFFICIAL_AUTHOR_ID,
  );
  const communityTrames = trameOptions.filter(
    (s) =>
      s.isPublic && (!OFFICIAL_AUTHOR_ID || s.authorId !== OFFICIAL_AUTHOR_ID),
  );

  const [activeTab, setActiveTab] = useState<'mine' | 'official' | 'community'>(
    myTrames.length > 0
      ? 'mine'
      : officialTrames.length > 0
        ? 'official'
        : 'community',
  );

  const matchesActiveFilter = (s: TrameOption) => {
    if (activeTab === 'mine') return !!profileId && s.authorId === profileId;
    if (activeTab === 'official')
      return (
        !!OFFICIAL_AUTHOR_ID && s.isPublic && s.authorId === OFFICIAL_AUTHOR_ID
      );
    return (
      s.isPublic && (!OFFICIAL_AUTHOR_ID || s.authorId !== OFFICIAL_AUTHOR_ID)
    );
  };

  // BilanType-specific state and helpers
  const { items: bilanTypes } = useBilanTypeStore();
  const { items: allSections } = useSectionStore();
  const currentBilanType = useMemo(
    () => (mode === 'bilanType' && selectedTrame ? bilanTypes.find((b) => b.id === selectedTrame.value) : undefined),
    [mode, selectedTrame, bilanTypes],
  );
  const navSections = useMemo(() => {
    if (mode !== 'bilanType' || !currentBilanType) return [] as Array<{ id: string; title: string; schema: Question[]; index: number }>;
    const map = currentBilanType.sections || [];
    const items = map
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((s, index) => {
        const sec = allSections.find((x) => x.id === s.sectionId);
        return {
          id: s.sectionId,
          title: (sec?.title as string) || `Section ${index + 1}`,
          schema: ((sec?.schema || []) as unknown as Question[]) || [],
          index,
        };
      });
    return items;
  }, [mode, currentBilanType, allSections]);

  const [activeBilanSectionId, setActiveBilanSectionId] = useState<string | null>(null);
  const [bilanAnswers, setBilanAnswers] = useState<Record<string, Answers>>({});
  const [excludedSectionIds, setExcludedSectionIds] = useState<string[]>([]);

  useEffect(() => {
    if (mode !== 'bilanType') return;
    if (!activeBilanSectionId && navSections.length > 0) {
      setActiveBilanSectionId(navSections[0].id);
    }
  }, [mode, navSections, activeBilanSectionId]);

  // Notify outer wrapper of active section changes (for footer label)
  useEffect(() => {
    if (mode !== 'bilanType') return;
    const active = navSections.find((s) => s.id === activeBilanSectionId);
    const detail = active
      ? { id: active.id, title: active.title }
      : { id: null as unknown as string, title: '' };
    const evt = new CustomEvent('bilan-type:active-changed', { detail });
    window.dispatchEvent(evt);
  }, [mode, activeBilanSectionId, navSections]);

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
            setBilanAnswers((prev) => ({ ...prev, [activeBilanSectionId]: content }));
            dataEntryRef.current?.load?.(content);
          } else {
            setInstanceId(null);
            setBilanAnswers((prev) => ({ ...prev, [activeBilanSectionId]: {} }));
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

  const stepTitles = [
    'Trame',
    "Ecrivez vos notes brutes ou saisissez les résultats de vos observations: c'est la matière brute utilisée par l'IA pour rédiger",
  ];

  const headerTitle =
    step === 1
      ? 'Choisissez ou créez une trame pour votre rédaction'
      : 'Ajoutez les données anonymisées du patient';

  const headerDescription = `Étape ${step}/${total} – ${stepTitles[step - 1]}`;

  let content: React.JSX.Element | null = null;

  if (step === 1) {
    const displayedTrames = trameOptions.filter(matchesActiveFilter);
    content = (
      <div className="space-y-4">
        {/* Toolbar sticky */}
        <div
          className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-wood-50/60
                      border-b border-wood-200 pt-2 pb-3"
        >
          <div className="flex items-center justify-between gap-3">
            <Tabs
              active={activeTab}
              onChange={(k) =>
                setActiveTab(k as 'mine' | 'official' | 'community')
              }
              tabs={[
                {
                  key: 'mine',
                  label: 'Mes trames',
                  count: myTrames.length,
                  hidden: myTrames.length === 0,
                },
                {
                  key: 'official',
                  label: 'Trames Bilan Plume',
                  count: officialTrames.length,
                },
                {
                  key: 'community',
                  label: 'Trames de la communauté',
                  count: communityTrames.length,
                },
              ]}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {displayedTrames.map((trame) => (
            <TrameCard
              key={trame.value}
              trame={{
                id: trame.value,
                title: trame.label,
                description: trame.description,
                sharedBy:
                  trame.isPublic && trame.author?.prenom
                    ? trame.author.prenom
                    : undefined,
              }}
              selected={selectedTrame?.value === trame.value}
              onSelect={() => onTrameChange(trame.value)}
              showLink={true}
            />
          ))}
          <CreerTrameModal
            trigger={
              <button
                type="button"
                aria-label="Créer une nouvelle trame"
                className="
                  group relative w-full min-h-[160px] max-w-60 w-full
                  rounded-xl border-2 border-dashed
                  border-primary-300 bg-primary-50/60
                  hover:bg-primary-100/70 hover:border-primary-400
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
                  transition-all duration-150
                  p-5 flex flex-col items-center justify-center text-center
                "
              >
                <span
                  className="
                    inline-flex h-10 w-10 items-center justify-center rounded-full
                    bg-primary-600 text-white mb-3 transition-transform
                    group-hover:scale-105
                  "
                >
                  <Plus className="h-5 w-5" />
                </span>
                <span className="font-semibold text-primary-700">
                  Créez votre trame
                </span>
                <span className="mt-1 text-sm text-primary-700/80">
                  Trame personnalisée à votre pratique
                </span>
              </button>
            }
            initialCategory={kindMap[sectionInfo.id]}
            onCreated={(id) =>
              navigate(`/creation-trame/${id}`, {
                state: {
                  returnTo: `/bilan/${bilanId}`,
                  wizardSection: sectionInfo.id,
                },
              })
            }
          />
        </div>
      </div>
    );
  } else {
    if (mode === 'bilanType') {
      const active = navSections.find((s) => s.id === activeBilanSectionId);
      const activeQuestions = active?.schema ?? [];
      const activeAnswers = (activeBilanSectionId && bilanAnswers[activeBilanSectionId]) || {};
      content = (
        <div className="flex flex-1 h-full overflow-y-hidden">
          <LeftNavBilanType
            items={navSections.map((s) => ({ id: s.id, title: s.title, index: s.index, disabled: excludedSectionIds.includes(s.id) }))}
            activeId={activeBilanSectionId}
            onSelect={(id) => {
              // Save current section before switching
              if (notesMode === 'manual' && activeBilanSectionId) {
                try {
                  const data = dataEntryRef.current?.save() as Answers | undefined;
                  if (data) void saveNotes(data, activeBilanSectionId);
                } catch {}
              }
              setActiveBilanSectionId(id);
              const next = bilanAnswers[id];
              if (next) dataEntryRef.current?.load?.(next);
            }}
            onToggleDisabled={(id) => {
              setExcludedSectionIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
              );
              // notify outer wrapper for bulk action
              try {
                const evt = new CustomEvent('bilan-type:excluded-changed', { detail: excludedSectionIds.includes(id) ? excludedSectionIds.filter(x => x !== id) : [...excludedSectionIds, id] });
                window.dispatchEvent(evt);
              } catch {}
            }}
          />
          <div className="flex-1 flex flex-col">
            <Tabs
              className="mb-4"
              active={notesMode}
              onChange={(k) => {
                setNotesMode(k as 'manual' | 'import');
                if (k === 'manual') {
                  setRawNotes('');
                  setImageBase64(undefined);
                }
              }}
              tabs={[
                { key: 'manual', label: 'Saisie manuelle' },
                { key: 'import', label: 'Import des notes' },
              ]}
            />
            {notesMode === 'manual' ? (
              <DataEntry
                ref={dataEntryRef}
                questions={activeQuestions}
                answers={activeAnswers}
                onChange={(a) => {
                  if (!activeBilanSectionId) return;
                  setBilanAnswers((prev) => ({ ...prev, [activeBilanSectionId]: a }));
                }}
                inline
              />
            ) : (
              <ImportNotes onChange={setRawNotes} onImageChange={setImageBase64} />
            )}
          </div>
        </div>
      );
    } else {
      content = (
        <div className="flex flex-1 h-full overflow-y-hidden flex-col">
          <Tabs
            className="mb-4"
            active={notesMode}
            onChange={(k) => {
              setNotesMode(k as 'manual' | 'import');
              if (k === 'manual') {
                setRawNotes('');
                setImageBase64(undefined);
              }
            }}
            tabs={[
              { key: 'manual', label: 'Saisie manuelle' },
              { key: 'import', label: 'Import des notes' },
            ]}
          />
          {notesMode === 'manual' ? (
            <DataEntry
              ref={dataEntryRef}
              questions={questions}
              answers={answers}
              onChange={onAnswersChange}
              inline
            />
          ) : (
            <ImportNotes onChange={setRawNotes} onImageChange={setImageBase64} />
          )}
        </div>
      );
    }
  }

  const [isManualSaving, setIsManualSaving] = useState(false);

  const saveNotes = async (
    notes: Answers | undefined,
    targetOverrideId?: string | null,
  ): Promise<string | null> => {
    const targetSectionId =
      targetOverrideId ?? (mode === 'bilanType' ? activeBilanSectionId : selectedTrame?.value);
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
        ? (activeBilanSectionId ? bilanAnswers[activeBilanSectionId] : {})
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
    const isTemplateMode = !!selectedTrame?.templateRefId && !!onGenerateFromTemplate;
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
        notesMode === 'manual' ? (dataEntryRef.current?.save() as Answers) : undefined;
      if (currentData) await saveNotes(currentData).catch(() => {});
    } catch {}

    // Iterate all sections of the selected BilanType
    for (const sec of navSections) {
      if (excludedSectionIds.includes(sec.id)) {
        console.log('[DEBUG] triggerGenerateAll - skipping excluded section', sec.id);
        continue;
      }
      try {
        // Load latest instanceId for this section to pass to template generation if supported
        let latestInstanceId: string | undefined = undefined;
        try {
          const res = await apiFetch<Array<{ id: string; contentNotes: Answers }>>(
            `/api/v1/bilan-section-instances?bilanId=${bilanId}&sectionId=${sec.id}&latest=true`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          latestInstanceId = res[0]?.id;
        } catch (e) {
          console.warn('[DEBUG] triggerGenerateAll - load latest failed for', sec.id, e);
        }

        const answersForSec = bilanAnswers[sec.id] || {};
        const isTemplateMode = !!selectedTrame?.templateRefId && !!onGenerateFromTemplate;

        if (isTemplateMode) {
          // Use per-section instance if available
          await onGenerateFromTemplate?.(
            notesMode === 'manual' ? answersForSec : undefined,
            rawNotes,
            latestInstanceId,
            imageBase64,
          );
        } else {
          console.log("here");
          await onGenerate(
            notesMode === 'manual' ? answersForSec : undefined,
            rawNotes,
            imageBase64,
          );
        }
      } catch (e) {
        console.error('[DEBUG] triggerGenerateAll - error on section', sec.id, e);
      }
    }
  };

  // External event listeners from wrapper (WizardAIBilanType)
  useEffect(() => {
    const onGenSelected = () => void triggerGenerateCurrent();
    const onGenAll = () => void triggerGenerateAll();
    const onSaveCurrent = () => {
      try {
        const data = notesMode === 'manual' ? (dataEntryRef.current?.save() as Answers) : undefined;
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
  }, [notesMode, rawNotes, imageBase64, bilanAnswers, navSections, selectedTrame, onGenerateFromTemplate, onGenerate, mode, token, bilanId, excludedSectionIds]);

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
      <div className="flex-1 overflow-y-auto px-4 min-h-0">{content}</div>

      {/* Row 3 — Footer glued to bottom (not sticky anymore) */}
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
            ) : (
              <div className="flex gap-2">
                <Button onClick={triggerGenerateCurrent} disabled={isGenerating} type="button">
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
    </div>
  );
}
