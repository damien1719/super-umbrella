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
  const total = 3;

  const next = () => setStep((s) => Math.min(total, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const stepTitles = ['Trame', 'Exemples', 'Données'];

  let content: JSX.Element | null = null;

  if (step === 1) {
    content = (
      <div className="space-y-4">
        <h3 className="text-center font-medium">{stepTitles[0]}</h3>
        <p className="text-sm text-center">
          Choisissez une trame parmi la bibliothèque.
          <br />
          Pour personnaliser les questions ou les résultats que vous souhaitez
          entrer vous pouvez créer votre propre trame
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
      </div>
    );
  } else if (step === 2) {
    content = (
      <div className="space-y-4">
        <h3 className="text-center font-medium">{stepTitles[1]}</h3>
        <p className="text-sm text-center">
          Ajoutez un exemple de rédaction d’un bilan déjà rédigé pour aider
          l&apos;IA à mieux coller à votre style de rédaction
          <br />
          Important: veuillez anonymiser les données (pas de nom et de prénom)
        </p>
        <ExampleManager
          examples={examples}
          onAddExample={onAddExample}
          onRemoveExample={onRemoveExample}
        />
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        <h3 className="text-center font-medium">{stepTitles[2]}</h3>
        <p className="text-sm text-center">
          Entrez les notes, les résultats chiffrés que vous avez sur la patient.
          C’est le coeur de la matière qui est utilisé par l’IA pour générer le
          bilan.
          <br />
          Important: veuillez anonymiser les données (pas de nom et de prénom)
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
          <DialogTitle className="flex items-center gap-2">
            {sectionInfo?.icon && <sectionInfo.icon className="h-5 w-5" />}
            {sectionInfo?.title} - Étape {step}/3
          </DialogTitle>
          <DialogDescription>
            Configuration de la génération pour{' '}
            {sectionInfo?.title?.toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s <= step
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${s < step ? 'bg-blue-500' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Trame</span>
            <span>Exemples</span>
            <span>Données</span>
          </div>
        </div>

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
