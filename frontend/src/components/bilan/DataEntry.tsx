import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Plus, Edit2 } from 'lucide-react';
import type { Question, Answers, ColumnDef } from '@/types/question';

interface DataEntryProps {
  questions: Question[];
  answers: Answers;
  onChange: (answers: Answers) => void;
  inline?: boolean;
}

const FIELD_BASE =
  "rounded-lg border border-gray-300 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none";

const FIELD_DENSE = "h-9 px-3"; // pour <Input> compacts


import { Check } from "lucide-react";

function Chip({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        // base
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
        // states
        selected
          ? "bg-primary-50 text-primary-700 border-primary-400"
          : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
        // shadow
        "shadow-sm",
      ].join(" ")}
    >
      {selected ? <Check className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}





export interface DataEntryHandle {
  save: () => Answers | void;
  getAnswers: () => Answers;
  load: (values: Answers) => void;
  clear: () => void;
}

export const DataEntry = forwardRef<DataEntryHandle, DataEntryProps>(
  function DataEntry(
    { questions, answers, onChange, inline = false }: DataEntryProps,
    ref,
  ) {
    const [open, setOpen] = useState(false);
    const [local, setLocal] = useState<Answers>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    type Titles = { id: string; title: string; index: number; items: Question[] };

    const titles: Titles[] = (() => {
      const res: Titles[] = [];
      let current: Titles | null = null;
      questions.forEach((q, i) => {
        if (q.type === "titre") {
          current = { id: `sec-${res.length}`, title: q.titre ?? "Section", index: res.length, items: [] };
          res.push(current);
        } else {
          if (!current) {
            current = { id: `sec-0`, title: "Général", index: 0, items: [] };
            res.push(current);
          }
          current.items.push(q);
        }
      });
      return res;
    })();

    const [activeSec, setActiveSec] = useState(0);
    const secRefs = sections.map(() => useState<HTMLDivElement | null>(null)[0]); // placeholder
    const containerRef = useState<HTMLDivElement | null>(null)[0]; // pour le scroll area

    // Crée un tableau de refs persistants
    const sectionEls = useRef<(HTMLDivElement | null)[]>([]);
    if (sectionEls.current.length !== sections.length) {
      sectionEls.current = Array(sections.length).fill(null);
    }

    useEffect(() => {
      const obs = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]) {
            const idx = Number(visible[0].target.getAttribute("data-idx"));
            if (!Number.isNaN(idx)) setActiveSec(idx);
          }
        },
        { root: document.querySelector("#dataentry-scroll-root"), rootMargin: "-20% 0px -70% 0px", threshold: 0.01 }
      );
      sectionEls.current.forEach((el) => el && obs.observe(el));
      return () => obs.disconnect();
    }, [sections.length]);

    const goTo = (i: number) => {
      const el = sectionEls.current[i];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    
    const goNext = () => goTo(Math.min(activeSec + 1, sections.length - 1));
    const goPrev = () => goTo(Math.max(activeSec - 1, 0));
    
    useEffect(() => {
      setLocal(answers);
    }, [answers]);

    const answeredCount = Object.keys(answers).length;

    const validateEchelle = (q: Question, v: string) => {
      if (q.type !== 'echelle' || !q.echelle) return;
      const num = Number(v);
      if (v === '') {
        setErrors((p) => ({ ...p, [q.id]: '' }));
        return;
      }
      if (isNaN(num) || num < q.echelle.min || num > q.echelle.max) {
        setErrors((p) => ({
          ...p,
          [q.id]: `Valeur entre ${q.echelle.min} et ${q.echelle.max}`,
        }));
      } else {
        setErrors((p) => ({ ...p, [q.id]: '' }));
      }
    };

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

    const renderQuestion = (q: Question) => {
      const value = local[q.id] ?? '';
      switch (q.type) {
        case 'notes':
          return (
            <Textarea
              value={String(value)}
              onChange={(e) => setLocal({ ...local, [q.id]: e.target.value })}
              placeholder={q.contenu}
              className={`min-h-20 ${FIELD_BASE}`}
            />
          );
        case "choix-multiple":
          return (
            <div className="flex flex-wrap gap-2">
              {q.options?.map((opt) => (
                <Chip
                  key={opt}
                  selected={value === opt}
                  onClick={() => setLocal({ ...local, [q.id]: opt })}
                >
                  {opt}
                </Chip>
              ))}
            </div>
          );
        case 'echelle':
          return (
            <div className="space-y-1">
              <Input
                type="number"
                value={String(value)}
                min={q.echelle?.min}
                max={q.echelle?.max}
                onChange={(e) => {
                  setLocal({ ...local, [q.id]: e.target.value });
                  validateEchelle(q, e.target.value);
                }}
                className={`${FIELD_BASE} ${FIELD_DENSE}`}
              />
              {errors[q.id] && (
                <p className="text-xs text-red-600">{errors[q.id]}</p>
              )}
            </div>
          );
        case 'tableau':
          let data: Record<string, Record<string, unknown>> & {
            commentaire?: string;
          } = {};
          if (
            local[q.id] &&
            typeof local[q.id] === 'object' &&
            !Array.isArray(local[q.id])
          ) {
            data = local[q.id] as Record<string, Record<string, unknown>> & {
              commentaire?: string;
            };
          }
          const renderCell = (rowId: string, col: ColumnDef) => {
            const cellValue = data[rowId]?.[col.id];
            const update = (v: unknown) => {
              const row = data[rowId] || {};
              const updatedRow = { ...row, [col.id]: v };
              const updated = { ...data, [rowId]: updatedRow };
              setLocal({ ...local, [q.id]: updated });
            };
            switch (col.valueType) {
              case 'number':
                return (
                  <Input
                    type="number"
                    size="sm"
                    value={(cellValue as number | string | undefined) ?? ''}
                    onChange={(e) =>
                      update(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    className={`${FIELD_BASE} ${FIELD_DENSE}`}
                  />
                );
              case 'choice':
                return (
                  <Select
                    value={(cellValue as string) ?? ''}
                    onValueChange={(v) => update(v)}
                  >
                    <SelectTrigger className="h-8 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {col.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              case 'bool':
                return (
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500/40"
                    checked={Boolean(cellValue)}
                    onChange={(e) => update(e.target.checked)}
                  />
                );
              case 'image':
                return (
                  <Input
                    size="sm"
                    value={(cellValue as string) ?? ''}
                    onChange={(e) => update(e.target.value)}
                    placeholder="URL"
                    className={`${FIELD_BASE} ${FIELD_DENSE}`}
                  />
                );
              default:
                return (
                  <Input
                    size="sm"
                    value={(cellValue as string) ?? ''}
                    onChange={(e) => update(e.target.value)}
                  />
                );
            }
          };
          return (
            <div className="space-y-2">
              {q.tableau?.rowsGroups?.map((rowsGroup) => (
                <div key={rowsGroup.id} className="mb-4">
                  {rowsGroup.title && (
                    <div className="px-2 py-1 font-bold text-sm">
                      {rowsGroup.title}
                    </div>
                  )}
                  <table className="w-full table-fixed border-collapse">
                    <thead>
                      <tr>
                        <th className="px-2 py-1"></th>
                        {q.tableau?.columns?.map((col) => (
                          <th
                            key={col.id}
                            className="px-2 py-1 text-xs font-medium text-left"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rowsGroup.rows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-2 py-1 text-xs font-medium">
                            {row.label}
                          </td>
                          {q.tableau?.columns?.map((col) => (
                            <td key={col.id} className="px-2 py-1">
                              {renderCell(row.id, col)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              {q.tableau?.commentaire && (
                <div>
                  <Label className="text-sm font-medium">Commentaire</Label>
                  <Textarea
                    value={data.commentaire || ''}
                    onChange={(e) =>
                      setLocal({
                        ...local,
                        [q.id]: { ...data, commentaire: e.target.value },
                      })
                    }
                  />
                </div>
              )}
            </div>
          );
        case 'titre':
          return null;
        default:
          return null;
      }
    };

    const form = (
      <div className="space-y-4">
        {questions.map((q) => (
          <div
            key={q.id}
            className={`space-y-2 p-2 rounded-md ${
              q.type === 'notes' ? 'focus-within:bg-wood-200/50' : ''
            }`}
          >
            {q.type === 'titre' ? (
              <div className="mt-8 border-t border-gray-200 pt-4 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
                  {q.icon ?? '•'}
                </span>
                <h3 className="text-xl font-bold">{q.titre}</h3>
              </div>
            ) : (
              <>
                <Label className="block text-sm font-medium text-gray-800 mb-1">{q.titre}</Label>
                {renderQuestion(q)}
              </>
            )}
          </div>
        ))}
      </div>
    );

    if (inline) {
      return <div className="mb-4">{form}</div>;
    }

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium text-gray-700">Réponses</Label>
        </div>
        {answeredCount === 0 ? (
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
            <DialogContent className="max-w-4xl p-0">
  {/* Header sticky avec titre + progression + actions */}
  <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <DialogTitle className="text-base font-semibold">Répondre</DialogTitle>
      {/* Progression simple */}
      <div className="text-xs text-gray-500">
        Section {activeSec + 1} / {sections.length}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={goPrev} disabled={activeSec === 0}>Précédent</Button>
      <Button size="sm" onClick={goNext} disabled={activeSec === sections.length - 1}>Suivant</Button>
      <Button size="sm" className="ml-2" onClick={save}>Sauvegarder</Button>
    </div>
  </div>

  {/* Corps en 2 colonnes : nav sticky + contenu scrollable */}
  <div className="grid grid-cols-[220px_1fr] h-[70vh]">
    {/* NAV STICKY */}
    <aside className="border-r bg-gray-50/60 p-3 overflow-auto">
      <nav className="space-y-1 sticky top-3">
        {sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={[
              "w-full text-left px-3 py-2 rounded-md text-sm transition",
              i === activeSec
                ? "bg-primary-50 text-primary-700 border border-primary-200"
                : "hover:bg-gray-100 text-gray-700"
            ].join(" ")}
          >
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] border">
              {i + 1}
            </span>
            {s.title}
          </button>
        ))}
      </nav>
    </aside>

    {/* CONTENU (scroll area) */}
    <div id="dataentry-scroll-root" className="overflow-y-auto px-5 py-4 space-y-8">
      {sections.map((s, i) => (
        <section
          key={s.id}
          ref={(el) => (sectionEls.current[i] = el)}
          data-idx={i}
          className="scroll-mt-4"
        >
          <header className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
              {i + 1}
            </span>
            <h3 className="text-lg font-semibold">{s.title}</h3>
          </header>

          <div className="space-y-4">
            {s.items.map((q) => (
              <div key={q.id} className="space-y-2">
                <Label className="block text-sm font-medium text-gray-800">{q.titre}</Label>
                {renderQuestion(q)}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  </div>
</DialogContent>

          </Dialog>
        ) : (
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
                        q.type === 'notes' ? 'focus-within:bg-blue-50/50' : ''
                      }`}
                    >
                      {q.type === 'titre' ? (
                        <h3 className="text-lg font-semibold">{q.titre}</h3>
                      ) : (
                        <>
                          <Label className="text-sm font-medium">
                            {q.titre}
                          </Label>
                          {renderQuestion(q)}
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
        )}
      </div>
    );
  },
);
