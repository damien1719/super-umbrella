import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import TrameCard from './TrameCard';
import CreerTrameModal from './ui/creer-trame-modale';
import { Plus } from 'lucide-react';
const kindMap: Record<string, string> = {
  anamnese: 'anamnese',
  'profil-sensoriel': 'profil_sensoriel',
  'observations-cliniques': 'observations',
  'tests-mabc': 'tests_standards',
  conclusions: 'conclusions',
};
import type { TrameOption, TrameExample } from './bilan/TrameSelector';
import { DataEntry, type DataEntryHandle } from './bilan/DataEntry';
import ExampleManager from './bilan/ExampleManager';
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
}

export default function WizardAIRightPanel({
  sectionInfo,
  trameOptions,
  selectedTrame,
  onTrameChange,
  examples,
  onAddExample,
  onRemoveExample,
  questions,
  answers,
  onAnswersChange,
  onGenerate,
  isGenerating,
  bilanId,
}: WizardAIRightPanelProps) {
  const [step, setStep] = useState(1);
  const dataEntryRef = useRef<DataEntryHandle>(null);
  const navigate = useNavigate();
  const total = 2;

  const next = () => setStep((s) => Math.min(total, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const stepTitles = ['Trame', 'Données'];

  const headerTitle =
    step === 1
      ? 'Choisissez une trame pour votre rédaction'
      : 'Ajoutez les données anonymisées du patient'

  const headerDescription = `Étape ${step}/${total} – ${stepTitles[step - 1]}`

  let content: JSX.Element | null = null;

  if (step === 1) {
    content = (
      <div className="space-y-4">
        <p className="text-md">
          Choisissez une trame parmi notre bibliothèque:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
          {trameOptions.map((trame) => (
            <TrameCard
              key={trame.value}
              trame={{
                id: trame.value,
                title: trame.label,
                description: trame.description,
              }}
              selected={selectedTrame?.value === trame.value}
              onSelect={() => onTrameChange(trame.value)}
            />
          ))}
        </div>

        <p className="text-md">
          Créez votre propre trame personnalisée:
        </p>
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
          Ecrivez vos notes brutes ou saisissez les résultats de vos observations: c'est la matière brute utilisée par l'IA pour rédiger
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

  return (
    <div className="p-4 space-y-4 flex flex-col h-full">
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
            onClick={() => {
              const data = dataEntryRef.current?.save() as Answers | undefined;
              onGenerate(data);
            }}
            disabled={isGenerating}
            type="button"
          >
            {isGenerating ? 'Génération...' : 'Générer'}
          </Button>
        )}
      </div>
    </div>
  );
}
