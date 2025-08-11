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
  onGenerate: (latest?: Answers) => void;
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
    () => profile?.id ?? (profile as any)?.id ?? null,
    [profile],
  );
  const OFFICIAL_AUTHOR_ID = import.meta.env.VITE_OFFICIAL_AUTHOR_ID;

  useEffect(() => {
    fetchProfile().catch(() => {});
  }, [fetchProfile]);

  const myTrames = trameOptions.filter(
    (s) => !!profileId && s.authorId === profileId,
  );
  const officialTrames = trameOptions.filter(
    (s) =>
      !!OFFICIAL_AUTHOR_ID &&
      s.isPublic &&
      s.authorId === OFFICIAL_AUTHOR_ID,
  );
  const communityTrames = trameOptions.filter(
    (s) =>
      s.isPublic &&
      (!OFFICIAL_AUTHOR_ID || s.authorId !== OFFICIAL_AUTHOR_ID),
  );
  const [activeTab, setActiveTab] = useState<'mine' | 'official' | 'community'>(
    'community',
  );
  const matchesActiveFilter = (s: TrameOption) => {
    if (activeTab === 'mine') return !!profileId && s.authorId === profileId;
    if (activeTab === 'official')
      return (
        !!OFFICIAL_AUTHOR_ID &&
        s.isPublic &&
        s.authorId === OFFICIAL_AUTHOR_ID
      );
    return s.isPublic && (!OFFICIAL_AUTHOR_ID || s.authorId !== OFFICIAL_AUTHOR_ID);
  };

  // Preload latest notes when section/trame changes
  useEffect(() => {
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
  }, [selectedTrame, bilanId, token]);

  const next = () => setStep((s) => Math.min(total, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const stepTitles = ['Trame', 'Données'];

  const headerTitle =
    step === 1
      ? 'Choisissez une trame pour votre rédaction'
      : 'Ajoutez les données anonymisées du patient';

  const headerDescription = `Étape ${step}/${total} – ${stepTitles[step - 1]}`;

  let content: JSX.Element | null = null;

  if (step === 1) {
    const displayedTrames = trameOptions.filter(matchesActiveFilter);
    content = (
      <div className="space-y-4">
        <p className="text-md">
          Choisissez une trame parmi notre bibliothèque:
        </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-auto-y">
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
            />
          ))}
        </div>

        <p className="text-md">Créez votre propre trame personnalisée:</p>
        <CreerTrameModal
          trigger={
            <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer text-gray-600 hover:bg-gray-50">
              <Plus className="h-6 w-6 mb-2" />
              Créer sa trame
            </div>
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
    );
  } else {
    content = (
      <div className="space-y-4">
        <p className="text-md">
          Ecrivez vos notes brutes ou saisissez les résultats de vos
          observations: c&apos;est la matière brute utilisée par l&apos;IA pour
          rédiger
        </p>
        <DataEntry
          ref={dataEntryRef}
          questions={questions}
          answers={answers}
          onChange={onAnswersChange}
          inline
        />
      </div>
    );
  }

  const saveNotes = async (notes: Answers | undefined) => {
    if (!selectedTrame) return;
    const body = instanceId
      ? { contentNotes: notes }
      : {
          bilanId,
          sectionId: selectedTrame.value,
          order: 0,
          contentNotes: notes,
        };
    const path = instanceId
      ? `/api/v1/bilan-section-instances/${instanceId}`
      : '/api/v1/bilan-section-instances';
    const method = instanceId ? 'PUT' : 'POST';
    const res = await apiFetch<{ id: string }>(path, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!instanceId) setInstanceId(res.id);
  };
  const handleClose = () => {
    if (step === 2) {
      setShowConfirm(true);
    } else {
      onCancel();
    }
  };

  return (
    <div className="p-4 space-y-4 flex flex-col h-full relative">
      <button
        type="button"
        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </button>
      <ExitConfirmation
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={async () => {
          const data = dataEntryRef.current?.save() as Answers | undefined;
          await saveNotes(data);
          onCancel();
        }}
        onCancel={() => {
          setShowConfirm(false);
          onCancel();
        }}
      />
      <div className="flex-1 space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            {headerTitle}
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600 mb-8">
            {headerDescription}
          </DialogDescription>
        </DialogHeader>

        {content}
      </div>
      <div className="flex justify-between pt-4">
        {step > 1 ? (
          <Button variant="secondary" onClick={prev} type="button">
            Précédent
          </Button>
        ) : (
          <span />
        )}
        {step < total ? (
          <Button onClick={next} type="button">
            Suivant
          </Button>
        ) : (
          <Button
            onClick={async () => {
              const data = dataEntryRef.current?.save() as Answers | undefined;
              await saveNotes(data);
              onGenerate(data);
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
        )}
      </div>
    </div>
  );
}
