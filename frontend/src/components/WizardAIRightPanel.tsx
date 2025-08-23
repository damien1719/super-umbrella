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

const kindMap: Record<string, string> = {
  anamnese: 'anamnese',
  'profil-sensoriel': 'profil_sensoriel',
  'observations-cliniques': 'observations',
  'tests-mabc': 'tests_standards',
  conclusion: 'conclusion',
};
import type { TrameOption, TrameExample } from './bilan/TrameSelector';
import { DataEntry, type DataEntryHandle } from './bilan/DataEntry';
import ImportNotes from './ImportNotes';
import type { Answers, Question } from '@/types/question';
import type { SectionInfo } from './bilan/SectionCard';

interface WizardAIRightPanelProps {
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
  isGenerating: boolean;
  bilanId: string;
  onCancel: () => void;
}

export default function WizardAIRightPanel({
  sectionInfo,
  trameOptions,
  selectedTrame,
  onTrameChange,
  questions,
  answers,
  onAnswersChange,
  onGenerate,
  onGenerateFromTemplate,
  isGenerating,
  bilanId,
  onCancel,
}: WizardAIRightPanelProps) {
  const [step, setStep] = useState(1);
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

  // Preload latest notes when entering step 2
  useEffect(() => {
    if (step !== 2 || !selectedTrame) return;
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
  }, [step, selectedTrame, bilanId, token]);

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

  const [isManualSaving, setIsManualSaving] = useState(false);


  const saveNotes = async (
    notes: Answers | undefined,
  ): Promise<string | null> => {
    if (!selectedTrame) return null;

    // Debug: trace d'où vient l'appel upsert
    console.trace('[DEBUG] saveNotes called - Stack trace:');
    console.log('[DEBUG] saveNotes - notes:', notes);
    console.log('[DEBUG] saveNotes - selectedTrame:', selectedTrame.value);
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
            sectionId: selectedTrame.value,
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
    const payload = JSON.stringify(answers ?? {});
    if (payload === lastSavedRef.current) return;
    const t = setTimeout(() => {
      (async () => {
        try {
          await saveNotes(answers);
          lastSavedRef.current = payload;
        } catch {
          // ignore autosave errors silently
        }
      })();
    }, 1000);
    return () => clearTimeout(t);
  }, [answers, step, isManualSaving]);

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
      const data = dataEntryRef.current?.save() as Answers | undefined;
      try {
/*         await saveNotes(data);
 */      } catch {
          /* ignore/option: toast */
      }
    } 
    onCancel(); 
  }; 

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
                <Button
                  onClick={async () => {
                    console.log(
                      '[DEBUG] WizardAIRightPanel - Generate button clicked:',
                      {
                        notesMode,
                        hasRawNotes: !!rawNotes,
                        hasImageBase64: !!imageBase64,
                        imageBase64Length: imageBase64?.length || 0,
                      },
                    );

                    const data: Answers =
                      notesMode === 'manual'
                        ? (dataEntryRef.current?.save() as Answers) || {}
                        : {};
                    await saveNotes(data);
                    onGenerate(
                      notesMode === 'manual' ? data : undefined,
                      rawNotes,
                      imageBase64,
                    );
                  }}
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
                {onGenerateFromTemplate && (
                  <Button
                    onClick={async () => {
                      console.log(
                        '[DEBUG] WizardAIRightPanel - GenerateFromTemplate button clicked:',
                        {
                          notesMode,
                          hasRawNotes: !!rawNotes,
                          hasImageBase64: !!imageBase64,
                          imageBase64Length: imageBase64?.length || 0,
                          instanceId,
                        },
                      );

                      const data: Answers =
                        notesMode === 'manual'
                          ? (dataEntryRef.current?.save() as Answers) || {}
                          : {};
                      const id = await saveNotes(data);
                      onGenerateFromTemplate(
                        notesMode === 'manual' ? data : undefined,
                        rawNotes,
                        id || undefined,
                        imageBase64,
                      );
                      onCancel();
                    }}
                    disabled={isGenerating}
                    type="button"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>Generate from template</>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
