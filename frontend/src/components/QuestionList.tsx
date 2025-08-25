import { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { GripVertical, Copy, Trash2, Plus } from 'lucide-react';
import type { Question } from '@/types/Typequestion';
import { EDITORS } from './Editors';

const typesQuestions = [
  { id: 'notes', title: 'Réponse (prise de notes)' },
  { id: 'choix-multiple', title: 'Choix multiples' },
  { id: 'echelle', title: 'Échelle chiffrée' },
  { id: 'tableau', title: 'Tableaux de résultats' },
  { id: 'titre', title: 'Titre de section' },
];

interface Props {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPatch: (id: string, partial: Partial<Question>) => void;
  onReorder: (from: number, to: number) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAddAfter: (id: string) => void;
}

export default function QuestionList({
  questions,
  selectedId,
  onSelect,
  onPatch,
  onReorder,
  onDuplicate,
  onDelete,
  onAddAfter,
}: Props) {
  const dragIndex = useRef<number | null>(null);
  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };
  const handleDragEnd = () => {
    dragIndex.current = null;
  };
  const handleDrop = (index: number) => {
    if (dragIndex.current === null || dragIndex.current === index) {
      dragIndex.current = null;
      return;
    }
    onReorder(dragIndex.current, index);
    dragIndex.current = null;
  };

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (selectedId) {
      const el = itemRefs.current[selectedId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedId]);

  return (
    <div className="space-y-6 overflow-y-auto h-full">
      {questions.map((question, index) => {
        const Editor = EDITORS[question.type];
        return (
          <div
            key={question.id}
            ref={(el) => {
              itemRefs.current[question.id] = el;
            }}
            className="relative w-full"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
          >
            <button
              aria-label="Déplacer la question"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              className={`absolute top left-1/2 cursor-move p-1 rounded transition-opacity opacity-100`}
            >
              <GripVertical className="h-5 w-5 text-gray-400 rotate-90" />
            </button>
            <Card
              onClick={() => onSelect(question.id)}
              className={`group w-[90%] mx-auto cursor-pointer transition-shadow ${
                selectedId === question.id
                  ? 'border-primary-500 ring-1 ring-primary-500 shadow-md'
                  : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Input
                    className={
                      question.type === 'titre'
                        ? 'text-3xl font-bold border-none shadow-none focus-visible:ring-0 p-0 flex-1'
                        : 'flex-1'
                    }
                    placeholder={
                      question.type === 'titre'
                        ? 'Titre de section'
                        : `Question ${index + 1}`
                    }
                    value={question.titre}
                    onChange={(e) =>
                      onPatch(question.id, { titre: e.target.value })
                    }
                  />
                  {selectedId === question.id && (
                    <Select
                      value={question.type}
                      onValueChange={(v) =>
                        onPatch(question.id, { type: v as Question['type'] })
                      }
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Type de réponse" />
                      </SelectTrigger>
                      <SelectContent>
                        {typesQuestions.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Editor q={question} onPatch={(p) => onPatch(question.id, p)} />
                <div
                  className={
                    `flex justify-end gap-2 pt-2 transition-opacity duration-200 ` +
                    (selectedId === question.id
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100')
                  }
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddAfter(question.id);
                    }}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(question.id);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(question.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            {selectedId === question.id && (
              <div className="flex flex-col absolute top-1/2 -translate-y-1/2 space-y-2">
                <Button
                  variant="primary"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddAfter(question.id);
                  }}
                >
                  <Plus className="h-6 w-6 text-white" />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(question.id);
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(question.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
