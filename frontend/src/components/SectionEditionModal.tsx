import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import QuestionList from '@/components/QuestionList';
import RightBarEdition from '@/components/RightBarEdition';
import type { Question, TableQuestion } from '@/types/Typequestion';
import { useSectionStore } from '@/store/sections';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
};

export default function SectionEditionModal({
  open,
  onOpenChange,
  sectionId,
}: Props) {
  const fetchOne = useSectionStore((s) => s.fetchOne);
  const update = useSectionStore((s) => s.update);

  const [title, setTitle] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const section = await fetchOne(sectionId);
        setTitle(section.title);
        const schema = (section.schema || []) as unknown as Question[];
        setQuestions(schema);
        setSelectedId(schema[0]?.id ?? null);
      } catch (e) {
        console.error('Failed to load section', e);
      }
    })();
  }, [open, sectionId, fetchOne]);

  const onPatch = (id: string, partial: Partial<Question>) => {
    setQuestions((qs: Question[]) =>
      qs.map((q: Question) => {
        if (q.id !== id) return q;
        let merged = { ...q, ...partial } as Question;
        // Handle tableau nested attributes merge
        if (
          q.type === 'tableau' &&
          partial.type === 'tableau' &&
          (partial as Partial<TableQuestion>).tableau
        ) {
          const tableQ = q as TableQuestion;
          const partialTable = partial as Partial<TableQuestion>;
          merged = {
            ...merged,
            tableau: { ...tableQ.tableau, ...partialTable.tableau },
          } as Question;
        }
        return merged;
      }),
    );
  };

  const onReorder = (from: number, to: number) => {
    setQuestions((qs: Question[]) => {
      const updated: Question[] = [...qs];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  };

  const onDuplicate = (id: string) => {
    const idx = questions.findIndex((q) => q.id === id);
    if (idx === -1) return;
    const original = questions[idx];
    const clone = {
      ...(JSON.parse(JSON.stringify(original)) as Question),
      id: Date.now().toString(),
      titre: `${original.titre} (copie)`,
    } as Question;
    setQuestions((qs) => {
      const before = qs.slice(0, idx + 1);
      const after = qs.slice(idx + 1);
      return [...before, clone, ...after];
    });
    setSelectedId(clone.id);
  };

  const onDelete = (id: string) => {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  };

  const onAddAfter = (targetId: string) => {
    const newQ: Question = {
      id: Date.now().toString(),
      type: 'notes',
      titre: '',
      contenu: '',
    } as Question;
    setQuestions((qs) => {
      if (!targetId) return [...qs, newQ];
      const idx = qs.findIndex((q) => q.id === targetId);
      if (idx === -1) return [...qs, newQ];
      return [...qs.slice(0, idx + 1), newQ, ...qs.slice(idx + 1)];
    });
    setSelectedId(newQ.id);
  };

  const onPasteAfter = (targetId: string, item: Question) => {
    const clone: Question = {
      ...(JSON.parse(JSON.stringify(item)) as Question),
      id: Date.now().toString(),
    } as Question;
    setQuestions((qs) => {
      if (!targetId) return [...qs, clone];
      const idx = qs.findIndex((q) => q.id === targetId);
      if (idx === -1) return [...qs, clone];
      return [...qs.slice(0, idx + 1), clone, ...qs.slice(idx + 1)];
    });
    setSelectedId(clone.id);
  };

  const disabled = useMemo(() => saving, [saving]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await update(sectionId, { schema: questions });
      onOpenChange(false);
    } catch (e) {
      console.error('Failed to save section', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="screen-90" className="p-0 overflow-x-hidden">
        <div className="flex flex-col h-full min-w-0">
          <div className="px-4 py-3 border-b border-wood-200 bg-white">
            <DialogHeader>
              <DialogTitle>Edition — {title}</DialogTitle>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto py-2">
            <div className="h-full relative bg-gray-50">
              {/*               <RightBarEdition
                items={questions}
                selected={selectedId}
                onPick={setSelectedId}
                onMove={onReorder}
                onDuplicate={onDuplicate}
                readOnly={disabled}
              /> */}
              <div className="h-full overflow-y-auto">
                <QuestionList
                  questions={questions}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onPatch={onPatch}
                  onReorder={onReorder}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  onAddAfter={onAddAfter}
                  onPasteAfter={onPasteAfter}
                  isReadOnly={disabled}
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 w-full shrink-0 px-4 py-3 border-t border-wood-200 bg-white flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Fermer
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
