import { useEffect, useMemo, useState } from 'react';
import ReadOnlyOverlay from '@/components/ReadOnlyOverlay';
import QuestionList from '@/components/QuestionList';
import { DataEntry } from '@/components/bilan/DataEntry';
import type { Question as EditQuestion } from '@/types/Typequestion';
import type { Question as RenderQuestion, Answers } from '@/types/question';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';

interface SectionGlimpseProps {
  title?: string;
  questions?: EditQuestion[];
  loading?: boolean;
}

export default function SectionGlimpse({
  title,
  questions = [],
  loading = false,
}: SectionGlimpseProps) {
  const [tab, setTab] = useState<'edition' | 'preview'>('edition');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});

  useEffect(() => {
    setSelectedId(questions?.[0]?.id ?? null);
  }, [questions]);

  const renderQuestions = useMemo(
    () => (questions as unknown as RenderQuestion[]) ?? [],
    [questions],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div className="px-4 py-3 bg-white flex items-center gap-4">
        <h3 className="text-lg font-semibold flex-1 truncate" title={title}>
          {title ?? 'Aperçu de section'}
        </h3>
        <div className="flex items-center gap-2">
          <Tabs
            tabs={[
              { key: 'edition', label: 'Édition' },
              { key: 'preview', label: 'Aperçu' },
            ]}
            active={tab}
            onChange={setTab}
            size="sm"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center text-gray-500">
            Chargement…
          </div>
        ) : tab === 'edition' ? (
          <div className="h-full overflow-y-auto">
            <div className="h-full overflow-y-auto p-2">
              {selectedId ? (
                <QuestionList
                  questions={questions}
                  selectedId={selectedId}
                  onSelect={(id) => setSelectedId(id)}
                  onPatch={(_id, _partial) => {
                    /* read-only */
                  }}
                  onReorder={(_from, _to) => {
                    /* read-only */
                  }}
                  onDuplicate={(_id) => {
                    /* read-only */
                  }}
                  onDelete={(_id) => {
                    /* read-only */
                  }}
                  onAddAfter={(_id) => {
                    /* read-only */
                  }}
                  isReadOnly={true}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 p-4 text-center">
                  Sélectionnez une partie à gauche pour l'afficher.
                  <br />
                  <br />
                  Vous pourrez ainsi copier des questions pour les réutiliser.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <ReadOnlyOverlay active className="h-full">
              <div className="h-full overflow-y-auto p-3">
                <DataEntry
                  inline
                  questions={renderQuestions}
                  draftKey={{
                    bilanId: 'section-glimpse',
                    sectionId: selectedId ?? 'preview',
                  }}
                  answers={answers}
                  onChange={setAnswers}
                />
              </div>
            </ReadOnlyOverlay>
          </div>
        )}
      </div>
    </div>
  );
}
