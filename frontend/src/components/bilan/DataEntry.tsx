import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import type { Question, Answers } from '@/types/question';
import { QuestionRenderer } from './QuestionRenderer';
import { GroupedQuestionsNav } from './GroupedQuestionsNav';

interface DataEntryProps {
  questions: Question[];
  answers: Answers;
  onChange: (answers: Answers) => void;
  inline?: boolean;
  showGroupNav?: boolean;
}

export interface DataEntryHandle {
  save: () => Answers | void;
  getAnswers: () => Answers;
  load: (values: Answers) => void;
  clear: () => void;
}

type QuestionGroup = {
  id: string;
  title: string;
  index: number;
  items: Question[];
};

export const DataEntry = forwardRef<DataEntryHandle, DataEntryProps>(
  function DataEntry(
    { questions, answers, onChange, inline = false, showGroupNav = true }: DataEntryProps,
    ref,
  ) {
    const [open, setOpen] = useState(false);
    const [local, setLocal] = useState<Answers>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const groups: QuestionGroup[] = (() => {
      const res: QuestionGroup[] = [];
      let current: QuestionGroup | null = null;
      questions.forEach((q) => {
        if (q.type === 'titre') {
          current = {
            id: `sec-${res.length}`,
            title: q.titre ?? 'Groupe de question',
            index: res.length,
            items: [],
          };
          res.push(current);
        } else {
          if (!current) {
            current = { id: `sec-0`, title: 'Général', index: 0, items: [] };
            res.push(current);
          }
          current.items.push(q);
        }
      });
      return res;
    })();

    const [activeSec, setActiveSec] = useState(0);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const groupEls = useRef<(HTMLDivElement | null)[]>([]);
    if (groupEls.current.length !== groups.length) {
      groupEls.current = Array(groups.length).fill(null);
    }

    useEffect(() => {
      const obs = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort(
              (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
            );
          if (visible[0]) {
            const idx = Number(visible[0].target.getAttribute('data-idx'));
            if (!Number.isNaN(idx)) setActiveSec(idx);
          }
        },
        {
          root: containerRef.current,
          rootMargin: '-20% 0px -70% 0px',
          threshold: 0.01,
        },
      );
      groupEls.current.forEach((el) => el && obs.observe(el));
      return () => obs.disconnect();
    }, [groups.length]);

    const goTo = (i: number) => {
      const el = groupEls.current[i];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const goNext = () => goTo(Math.min(activeSec + 1, groups.length - 1));
    const goPrev = () => goTo(Math.max(activeSec - 1, 0));

    useEffect(() => {
      setLocal(answers);
    }, [answers]);

    const save = () => {
      if (Object.values(errors).some((e) => e)) {
        return;
      }
      onChange(local);
      setOpen(false);
      return local;
    };

    useImperativeHandle(ref, () => ({
      save,
      getAnswers: () => local,
      load: (values: Answers) => setLocal(values ?? {}),
      clear: () => setLocal({}),
    }));

    const inlineForm = (
      <div
        id="dataentry-scroll-root"
        ref={containerRef}
        className="h-[80vh] flex-1 overflow-y-auto overscroll-contain px-4"
      >
        {groups.map((group, i) => (
          <div
            key={group.id}
            data-idx={i}
            ref={(el) => {
              groupEls.current[i] = el;
            }}
            className="space-y-4"
          >
            <div className="relative z-10 mt-8 border-t border-gray-200 pt-4 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-100">
                <span className="block h-1.5 w-1.5 rounded-full bg-primary-500" />
              </span>
              <h3 className="text-xl font-bold">{group.title}</h3>
            </div>
            {group.items.map((q) => (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className="space-y-2 p-2 rounded-md"
              >
                <Label className="block text-sm font-medium text-gray-800 mb-1">
                  {q.titre}
                </Label>
                <QuestionRenderer
                  question={q}
                  value={local[q.id]}
                  onChange={(v) =>
                    setLocal({
                      ...local,
                      [q.id]: v as
                        | string
                        | number
                        | boolean
                        | string[]
                        | Record<string, unknown>,
                    })
                  }
                  error={errors[q.id]}
                  setError={(msg) => setErrors((p) => ({ ...p, [q.id]: msg }))}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );

    if (inline) {
      return (
        <div className="flex h-screen overflow-hidden">
          {/* Nav gauche */}
          {showGroupNav && (
            <GroupedQuestionsNav
              groups={groups}
              active={activeSec}
              onNavigate={goTo}
              onPrev={goPrev}
              onNext={goNext}
            />
          )}

          {/* Form droit */}
          {inlineForm}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium text-gray-700">Réponses</Label>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs border-2 border-dashed border-gray-300 text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50"
            >
              <Plus className="h-3 w-3 mr-2" /> Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Répondre
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`space-y-2 p-2 rounded-md border ${
                    q.type === 'notes' ? 'focus-within:bg-wood-200/50' : ''
                  }`}
                >
                  {q.type === 'titre' ? (
                    <div className="relative z-10 mt-8 border-t border-gray-200 pt-4 flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                        <span className="block h-1.5 w-1.5 rounded-full bg-blue-700" />
                      </span>
                      <h3 className="text-xl font-bold">{q.titre}</h3>
                    </div>
                  ) : (
                    <>
                      <Label className="block text-sm font-medium text-gray-800 mb-1">
                        {q.titre}
                      </Label>
                      <QuestionRenderer
                        question={q}
                        value={local[q.id]}
                        onChange={(v) =>
                          setLocal({
                            ...local,
                            [q.id]: v as
                              | string
                              | number
                              | boolean
                              | string[]
                              | Record<string, unknown>,
                          })
                        }
                        error={errors[q.id]}
                        setError={(msg) =>
                          setErrors((p) => ({ ...p, [q.id]: msg }))
                        }
                      />
                    </>
                  )}
                </div>
              ))}
              <Button onClick={save} className="w-full mt-4">
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/*         ) : (
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="text-xs text-gray-600 mb-2">
                Réponses enregistrées
              </div>
              {questions.slice(0, 2).map((q) => (
                <div key={q.id} className="text-xs text-gray-700 truncate">
                  • {q.titre}
                </div>
              ))}
              {answeredCount > 2 && (
                <div className="text-xs text-gray-500">
                  +{answeredCount - 2} autres...
                </div>
              )}
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  <Edit2 className="h-3 w-3 mr-2" /> Modifier mes réponses
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    Modifier les réponses
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className={`space-y-2 p-2 rounded-md border border-gray-200${
                        q.type === 'notes' ? ' focus-within:bg-blue-50/50' : ''
                      }`}
                    >
                      {q.type === 'titre' ? (
                        <h3 className="text-lg font-semibold">{q.titre}</h3>
                      ) : (
                        <>
                          <Label className="text-sm font-medium">
                            {q.titre}
                          </Label>
                          <QuestionRenderer
                            question={q}
                            value={local[q.id]}
                            onChange={(v) => setLocal({ ...local, [q.id]: v })}
                            error={errors[q.id]}
                            setError={(msg) =>
                              setErrors((p) => ({ ...p, [q.id]: msg }))
                            }
                          />
                        </>
                      )}
                    </div>
                  ))}
                  <Button onClick={save} className="w-full mt-4">
                    Sauvegarder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )} */}
      </div>
    );
  },
);
