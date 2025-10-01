import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  SectionDisponible,
  type BilanElement,
} from '@/components/bilanType/SectionDisponible';
import SectionGlimpse from '@/components/SectionGlimpse';
import { useSectionStore } from '@/store/sections';
import type { Question as EditQuestion } from '@/types/Typequestion';
import { useUserProfileStore } from '@/store/userProfile';
import type { Origin } from '@/components/ui/origin-tag';

interface InspirationPanelProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  titleLeft?: string;
  /** Insertion directe dans la trame en cours */
  onInsertQuestion?: (q: EditQuestion) => void;
}

export default function InspirationPanel({
  open,
  onOpenChange,
  titleLeft,
  onInsertQuestion,
}: InspirationPanelProps) {
  const items = useSectionStore((s) => s.items);
  const fetchAll = useSectionStore((s) => s.fetchAll);
  const fetchOne = useSectionStore((s) => s.fetchOne);
  const myProfileId = useUserProfileStore((s) => s.profileId);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [selectedQuestions, setSelectedQuestions] = useState<EditQuestion[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchAll().catch(() => {
      /* silent */
    });
  }, [open, fetchAll]);

  useEffect(() => {
    if (!open) {
      // reset when closing
      setSelectedSectionId(null);
      setSelectedQuestions([]);
      setSelectedTitle('');
    }
  }, [open]);

  useEffect(() => {
    if (!selectedSectionId) return;
    setLoading(true);
    fetchOne(selectedSectionId)
      .then((section) => {
        setSelectedTitle(section.title);
        const schema = (
          Array.isArray(section.schema) ? section.schema : []
        ) as EditQuestion[];
        setSelectedQuestions(schema);
      })
      .finally(() => setLoading(false));
  }, [selectedSectionId, fetchOne]);

  const availableElements: BilanElement[] = useMemo(() => {
    const computeOrigin = (s: (typeof items)[number]): Origin | undefined => {
      if (s.source === 'BILANPLUME') return 'BILANPLUME';
      if (s.authorId && myProfileId && s.authorId === myProfileId)
        return 'MINE';
      if (s.isPublic) return 'COMMUNITY';
      return undefined;
    };
    return items.map((s) => ({
      id: s.id,
      type: s.kind,
      title: s.title,
      description: s.description ?? '',
      metier: s.job?.[0],
      origin: computeOrigin(s),
    }));
  }, [items, myProfileId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="screen-90"
        className="max-w-[90vw] w-[90vw] h-[90vh] overflow-hidden p-0"
      >
        <DialogHeader className="px-6 pt-4 pb-2 border-b border-wood-200">
          <DialogTitle>
            Explorer parmi la bibliothèque pour réutiliser les questions qui
            vous correspondent
          </DialogTitle>
        </DialogHeader>
        <div className="h-[calc(90vh-3.25rem)] flex overflow-x-auto">
          {/* Left - available sections */}
          <div className="w-[38%] min-w-[320px] max-w-[560px] h-full overflow-hidden">
            <div className="h-full overflow-y-auto p-4">
              <SectionDisponible
                availableElements={availableElements}
                onAddElement={() => {
                  /* no-op in inspiration mode */
                }}
                onSelectElement={(el) => setSelectedSectionId(el.id)}
                hideOpenAction
                hideDuplicateAction
                titleOverride={titleLeft}
              />
            </div>
          </div>
          {/* Right - glimpse */}
          <div className="flex-1 h-full overflow-hidden">
            <SectionGlimpse
              title={selectedTitle}
              questions={selectedQuestions}
              loading={loading}
              onInsertQuestion={onInsertQuestion && ((q) => {
                onInsertQuestion(q);
                // Fermer le panneau après insertion pour retour rapide à l'édition
              })}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
