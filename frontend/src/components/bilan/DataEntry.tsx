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
import type { Question, Answers } from '@/types/question';

interface DataEntryProps {
  questions: Question[];
  answers: Answers;
  onChange: (answers: Answers) => void;
  inline?: boolean;
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
              className="min-h-20"
            />
          );
        case 'choix-multiple':
          return (
            <div className="flex flex-wrap gap-2">
              {q.options?.map((opt) => (
                <Button
                  key={opt}
                  size="sm"
                  variant={value === opt ? 'default' : 'outline'}
                  onClick={() => setLocal({ ...local, [q.id]: opt })}
                >
                  {opt}
                </Button>
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
          const renderCell = (ligne: string, col: string) => {
            const cellValue = data[ligne]?.[col];
            const update = (v: unknown) => {
              const row = data[ligne] || {};
              const updatedRow = { ...row, [col]: v };
              const updated = { ...data, [ligne]: updatedRow };
              setLocal({ ...local, [q.id]: updated });
            };
            switch (q.tableau?.valeurType) {
              case 'score':
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
                  />
                );
              case 'choix-multiple':
                return (
                  <Select
                    value={(cellValue as string) ?? ''}
                    onValueChange={(v) => update(v)}
                  >
                    <SelectTrigger className="h-8 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {q.tableau?.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              case 'case-a-cocher':
                return (
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={Boolean(cellValue)}
                    onChange={(e) => update(e.target.checked)}
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
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    <th className="px-2 py-1"></th>
                    {q.tableau?.colonnes?.map((col) => (
                      <th
                        key={col}
                        className="px-2 py-1 text-xs font-medium text-left"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {q.tableau?.lignes?.map((ligne) => (
                    <tr key={ligne}>
                      <td className="px-2 py-1 text-xs font-medium">{ligne}</td>
                      {q.tableau?.colonnes?.map((col) => (
                        <td key={col} className="px-2 py-1">
                          {renderCell(ligne, col)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <h3 className="text-3xl font-semibold">{q.titre}</h3>
            ) : (
              <>
                <Label className="text-sm font-medium">{q.titre}</Label>
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
                className="w-full text-xs border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
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
                      <h3 className="text-lg font-semibold">{q.titre}</h3>
                    ) : (
                      <>
                        <Label className="text-sm font-medium">{q.titre}</Label>
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
