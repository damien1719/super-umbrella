import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Question, Answers } from '@/types/question';
import { TrameSelector, TrameOption, TrameExample } from './TrameSelector';
import { DataEntry } from './DataEntry';

export interface SectionInfo {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
}

interface SectionCardProps {
  section: SectionInfo;
  trameOptions: TrameOption[];
  selectedTrame: TrameOption | undefined;
  onTrameChange: (value: string) => void;
  examples: TrameExample[];
  onAddExample: (example: Omit<TrameExample, 'id'>) => void;
  onRemoveExample: (id: string) => void;
  questions: Question[];
  answers: Answers;
  onAnswersChange: (a: Answers) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  active: boolean;
}

export function SectionCard({
  section,
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
  active,
}: SectionCardProps) {
  return (
    <Card
      className={`transition-all hover:shadow-md ${active ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${active ? 'bg-blue-100' : 'bg-gray-100'}`}
          >
            <section.icon
              className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-600'}`}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm mb-1">{section.title}</h3>
            <p className="text-xs text-gray-500 mb-4">{section.description}</p>
            <TrameSelector
              options={trameOptions}
              value={selectedTrame?.value || ''}
              onChange={onTrameChange}
              examples={examples}
              onAddExample={onAddExample}
              onRemoveExample={onRemoveExample}
            />
            <DataEntry
              questions={questions}
              answers={answers}
              onChange={onAnswersChange}
            />
            <Button
              size="sm"
              variant={active ? 'default' : 'outline'}
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full text-xs"
            >
              {isGenerating && active ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                  Génération...
                </>
              ) : (
                <>
                  <Wand2 className="h-3 w-3 mr-2" />
                  Générer
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
