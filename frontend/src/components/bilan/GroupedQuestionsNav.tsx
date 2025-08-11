import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r bg-white sticky top-0 h-screen p-3">
      <div className="flex-1 overflow-y-auto space-y-1">
        {groups.map((g, i) => (
          <button
            key={g.id}
            onClick={() => onNavigate(i)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors',
              i === active && 'bg-muted font-medium'
            )}
          >
            {g.title}
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-2 border-t">
        <Button variant="outline" size="sm" onClick={onPrev} className="w-1/2">
          <ChevronLeft className="h-4 w-4 mr-1" /> Préc.
        </Button>
        <Button size="sm" onClick={onNext} className="w-1/2">
          Suiv. <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </aside>
  );
}
