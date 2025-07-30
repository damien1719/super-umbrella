import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WizardProgress } from './WizardProgress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TrameOption, TrameExample } from './bilan/TrameSelector';
import { DataEntry } from './bilan/DataEntry';
import ExampleManager from './bilan/ExampleManager';
import type { Answers, Question } from '@/types/question';

interface WizardAIRightPanelProps {
  trameOptions: TrameOption[];
  selectedTrame: TrameOption | undefined;
  onTrameChange: (value: string) => void;
  examples: TrameExample[];
  onAddExample: (ex: Omit<TrameExample, 'id'>) => void;
  onRemoveExample: (id: string) => void;
  questions: Question[];
  answers: Answers;
  onAnswersChange: (a: Answers) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onCancel: () => void;
}

export default function WizardAIRightPanel({
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
  onCancel,
}: WizardAIRightPanelProps) {
  const [step, setStep] = useState(1);
  const total = 3;

  const next = () => setStep((s) => Math.min(total, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  let content: JSX.Element | null = null;

  if (step === 1) {
    content = (
      <div className="space-y-4">
        <p className="text-sm">Choisissez une trame parmi la bibliothèque :</p>
        <Select
          value={selectedTrame?.value || ''}
          onValueChange={onTrameChange}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {trameOptions.map((trame) => (
              <SelectItem key={trame.value} value={trame.value}>
                {trame.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  } else if (step === 2) {
    content = (
      <ExampleManager
        examples={examples}
        onAddExample={onAddExample}
        onRemoveExample={onRemoveExample}
      />
    );
  } else {
    content = (
      <DataEntry
        questions={questions}
        answers={answers}
        onChange={onAnswersChange}
        inline
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      <WizardProgress step={step} total={total} />
      {content}
      <div className="flex justify-between pt-2">
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
          <Button onClick={onGenerate} disabled={isGenerating} type="button">
            {isGenerating ? 'Génération...' : 'Générer'}
          </Button>
        )}
      </div>
      <div className="pt-2">
        <Button
          variant="ghost"
          onClick={onCancel}
          type="button"
          className="w-full text-xs"
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}
