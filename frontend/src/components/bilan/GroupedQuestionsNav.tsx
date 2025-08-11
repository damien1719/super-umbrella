// GroupedQuestionsNav.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionGroup { id: string; title: string; index: number }
interface Props {
  groups: QuestionGroup[];
  active: number;
  onNavigate: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function GroupedQuestionsNav({ groups, active, onNavigate, onPrev, onNext }: Props) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 border-r border-wood-200 bg-white sticky top-0 h-[calc(100vh-0px)]">
      <div className="flex flex-col w-full">
        {/* Header (optional) */}
        <div className="px-3 py-2 border-b border-wood-200 text-xs text-muted-foreground">
          Sections ({active + 1}/{groups.length})
        </div>

        {/* List */}
        <nav className="flex-1 overflow-y-hidden py-2">
          {groups.map((g, i) => (
            <button
              key={g.id}
              onClick={() => onNavigate(i)}
              className={cn(
                "group relative w-full flex items-center gap-3 px-3 py-2 text-left text-sm",
                i === active ? "bg-muted/40 font-medium" : "hover:bg-muted/30"
              )}
            >
              {/* Active rail */}
              <span
                className={cn(
                  "absolute left-0 top-0 h-full w-0.5 rounded-r",
                  i === active ? "bg-primary" : "bg-transparent"
                )}
              />
              {/* Index badge (subtle, not chip) */}
              <span className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded border-wood-200 text-[11px]",
                i === active ? "border-primary text-primary" : "border-wood-200 text-gray-500"
              )}>
                {i + 1}
              </span>
              <span className="truncate">{g.title}</span>
            </button>
          ))}
        </nav>

        {/* Controls */}
{/*         <div className="px-3 py-2 border-t grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Préc.
          </Button>
          <Button size="sm" onClick={onNext}>
            Suiv. <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div> */}
      </div>
    </aside>
  );
}
