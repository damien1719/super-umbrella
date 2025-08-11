import React from 'react';
import { Button } from '@/components/ui/button';

interface QuestionGroup {
  id: string;
  title: string;
  index: number;
}

interface GroupedQuestionsNavProps {
  groups: QuestionGroup[];
  active: number;
  onNavigate: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function GroupedQuestionsNav({
  groups,
  active,
  onNavigate,
  onPrev,
  onNext,
}: GroupedQuestionsNavProps) {
  return (
    <div className="sticky top-0 z-10 bg-white flex items-center gap-2 py-2 shadow mb-4">
      <Button size="sm" variant="outline" onClick={onPrev}>
        Prev
      </Button>
      <div className="flex-1 flex justify-center gap-2 overflow-x-auto">
        {groups.map((g, i) => (
          <button
            key={g.id}
            onClick={() => onNavigate(i)}
            className={`px-2 py-1 text-sm ${i === active ? 'font-bold underline' : ''}`}
          >
            {g.title}
          </button>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={onNext}>
        Suiv
      </Button>
    </div>
  );
}
