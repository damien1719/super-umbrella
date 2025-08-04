import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Question } from '@/types/Typequestion';
import { Trash2 } from 'lucide-react';

export type EditorProps = {
  q: Question;
  onPatch: (p: Partial<Question>) => void;
};

export function NotesEditor({ q, onPatch }: EditorProps) {
  return (
    <div className="space-y-4">
      <Input
        value={q.titre}
        placeholder="Question"
        onChange={(e) => onPatch({ titre: e.target.value })}
      />
      <div className="w-full rounded px-3 py-2 border-b border-dotted border-gray-200 text-gray-600">
        Réponse (prise de notes)
      </div>
    </div>
  );
}

export function MultiChoiceEditor({ q, onPatch }: EditorProps) {
  const options = ('options' in q && q.options) || [];
  const updateOption = (idx: number, value: string) => {
    const opts = [...options];
    opts[idx] = value;
    onPatch({ options: opts } as Partial<Question>);
  };
  const removeOption = (idx: number) => {
    const opts = options.filter((_, i) => i !== idx);
    onPatch({ options: opts } as Partial<Question>);
  };
  const addOption = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onPatch({ options: [...options, trimmed] } as Partial<Question>);
  };
  return (
    <div className="space-y-4">
      <Input
        value={q.titre}
        placeholder="Question"
        onChange={(e) => onPatch({ titre: e.target.value })}
      />
      <div>
        <Label>Options de réponse</Label>
        <div className="space-y-2">
          {options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-2">
              <Input
                value={option}
                onChange={(e) => updateOption(optionIndex, e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeOption(optionIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Input
            placeholder="Ajouter une option"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addOption(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            onBlur={(e) => {
              addOption(e.currentTarget.value);
              e.currentTarget.value = '';
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function ScaleEditor({ q, onPatch }: EditorProps) {
  return (
    <div className="space-y-4">
      <Input
        value={q.titre}
        placeholder="Question"
        onChange={(e) => onPatch({ titre: e.target.value })}
      />
      {/* Placeholder for scale configuration */}
    </div>
  );
}

export function TableEditor({ q, onPatch }: EditorProps) {
  const tableau = 'tableau' in q ? q.tableau || { lignes: [] } : { lignes: [] };
  const addLine = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onPatch({
      tableau: { ...tableau, lignes: [...(tableau.lignes || []), trimmed] },
    } as Partial<Question>);
  };
  const addColumn = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onPatch({
      tableau: { ...tableau, colonnes: [...(tableau.colonnes || []), trimmed] },
    } as Partial<Question>);
  };
  const updateColumn = (idx: number, value: string) => {
    const colonnes = [...(tableau.colonnes || [])];
    colonnes[idx] = value;
    onPatch({ tableau: { ...tableau, colonnes } } as Partial<Question>);
  };
  const removeColumn = (idx: number) => {
    const colonnes = (tableau.colonnes || []).filter((_, i) => i !== idx);
    onPatch({ tableau: { ...tableau, colonnes } } as Partial<Question>);
  };
  const updateLine = (idx: number, value: string) => {
    const lignes = [...(tableau.lignes || [])];
    lignes[idx] = value;
    onPatch({ tableau: { ...tableau, lignes } } as Partial<Question>);
  };
  const removeLine = (idx: number) => {
    const lignes = (tableau.lignes || []).filter((_, i) => i !== idx);
    onPatch({ tableau: { ...tableau, lignes } } as Partial<Question>);
  };
  const toggleComment = () => {
    onPatch({
      tableau: { ...tableau, commentaire: !tableau.commentaire },
    } as Partial<Question>);
  };
  const setValeurType = (v: string) => {
    onPatch({
      tableau: {
        ...tableau,
        valeurType: v as 'texte' | 'score' | 'choix-multiple' | 'case-a-cocher',
        options: v === 'choix-multiple' ? tableau.options || [] : undefined,
      },
    } as Partial<Question>);
  };
  const addOption = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onPatch({
      tableau: { ...tableau, options: [...(tableau.options || []), trimmed] },
    } as Partial<Question>);
  };
  const removeOption = (idx: number) => {
    const opts = (tableau.options || []).filter((_, i) => i !== idx);
    onPatch({ tableau: { ...tableau, options: opts } } as Partial<Question>);
  };

  return (
    <div className="space-y-4">
      <Input
        value={q.titre}
        placeholder="Question"
        onChange={(e) => onPatch({ titre: e.target.value })}
      />
      <div className="flex-shrink-0 w-full overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th className="p-1"></th>
              {tableau.colonnes?.map((col, colIdx) => (
                <th key={colIdx} className="p-1">
                  <div className="flex items-center gap-2">
                    <Input
                      className="flex-1"
                      value={col}
                      onChange={(e) => updateColumn(colIdx, e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeColumn(colIdx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </th>
              ))}
              <th className="p-1">
                <Input
                  placeholder="Ajouter une colonne"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      addColumn(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  onBlur={(e) => {
                    if (e.currentTarget.value.trim()) {
                      addColumn(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {tableau.lignes?.map((ligne, ligneIdx) => (
              <tr key={ligneIdx}>
                <th className="p-1">
                  <div className="group relative flex items-center gap-2">
                    <Input
                      className="w-50"
                      value={ligne}
                      onChange={(e) => updateLine(ligneIdx, e.target.value)}
                    />
                    <Button
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLine(ligneIdx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </th>
                {tableau.colonnes?.map((_, colIdx) => (
                  <td key={colIdx} className="p-1">
                    <Input disabled className="pointer-events-none" />
                  </td>
                ))}
                <td className="p-1"></td>
              </tr>
            ))}
            <tr>
              <th className="p-1">
                <Input
                  placeholder="Ajouter une ligne"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      addLine(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  onBlur={(e) => {
                    if (e.currentTarget.value.trim()) {
                      addLine(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </th>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="space-y-2">
        {tableau.commentaire ? (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleComment}
              className="text-red-500 hover:text-red-700"
            >
              Retirer le commentaire
            </Button>
            <div className="p-2 border rounded">
              <p className="text-sm text-gray-500 mb-1">
                La zone de commentaire sera disponible lors de la saisie des
                données
              </p>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={toggleComment}>
            + Ajouter une zone de commentaire
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Label>Type de valeur</Label>
          <Select
            value={tableau.valeurType || 'texte'}
            onValueChange={setValeurType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Texte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="texte">Texte</SelectItem>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="choix-multiple">Choix multiples</SelectItem>
              <SelectItem value="case-a-cocher">Case à cocher</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {tableau.valeurType === 'choix-multiple' && (
          <div className="space-y-2">
            {tableau.options?.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) => {
                    const opts = [...(tableau.options || [])];
                    opts[idx] = e.target.value;
                    onPatch({
                      tableau: { ...tableau, options: opts },
                    } as Partial<Question>);
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeOption(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Input
              placeholder="Ajouter une valeur"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  addOption(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function TitleEditor({ q, onPatch }: EditorProps) {
  return (
    <Input
      value={q.titre}
      placeholder="Titre de section"
      className="text-3xl font-bold border-none shadow-none focus-visible:ring-0 p-0"
      onChange={(e) => onPatch({ titre: e.target.value })}
    />
  );
}

export const EDITORS: Record<
  Question['type'],
  (props: EditorProps) => JSX.Element
> = {
  notes: NotesEditor,
  'choix-multiple': MultiChoiceEditor,
  echelle: ScaleEditor,
  tableau: TableEditor,
  titre: TitleEditor,
};
