import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
  Question,
  SurveyTable,
  ColumnDef,
  Row,
  RowsGroup,
} from '@/types/Typequestion';
import { X, MoreVertical } from 'lucide-react';
import ChoixTypeDeValeurTableau from './ChoixTypeDeValeurTableau';

export type EditorProps = {
  q: Question;
  onPatch: (p: Partial<Question>) => void;
};

export function NotesEditor({}: EditorProps) {
  return (
    <div className="space-y-4">
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
                <X className="h-4 w-4" />
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

export function ScaleEditor({}: EditorProps) {
  return (
    <div className="space-y-4">{/* Placeholder for scale configuration */}</div>
  );
}

export function TableEditor({ q, onPatch }: EditorProps) {
  const genId = () => Math.random().toString(36).slice(2);
  const tableau: SurveyTable & { commentaire?: boolean } = q.tableau || {
    columns: [],
    rowsGroups: [{ id: genId(), title: '', rows: [] }],
  };
  const rowsGroup: RowsGroup = tableau.rowsGroups[0] || {
    id: genId(),
    title: '',
    rows: [],
  };

  const setTable = (tb: SurveyTable & { commentaire?: boolean }) => {
    onPatch({ tableau: tb } as Partial<Question>);
  };

  const addColumn = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const newCol: ColumnDef = {
      id: genId(),
      label: trimmed,
      valueType: 'text',
    };
    setTable({ ...tableau, columns: [...tableau.columns, newCol] });
  };

  const updateColumn = (idx: number, value: string) => {
    const cols = [...tableau.columns];
    cols[idx] = { ...cols[idx], label: value };
    setTable({ ...tableau, columns: cols });
  };

  const removeColumn = (idx: number) => {
    const cols = tableau.columns.filter((_, i) => i !== idx);
    setTable({ ...tableau, columns: cols });
  };

  const addLine = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const newRow: Row = { id: genId(), label: trimmed };
    const newRowsGroup = { ...rowsGroup, rows: [...rowsGroup.rows, newRow] };
    setTable({
      ...tableau,
      rowsGroups: [newRowsGroup, ...tableau.rowsGroups.slice(1)],
    });
  };

  const updateLine = (idx: number, value: string) => {
    const rows = [...rowsGroup.rows];
    rows[idx] = { ...rows[idx], label: value };
    const newRowsGroup = { ...rowsGroup, rows };
    setTable({
      ...tableau,
      rowsGroups: [newRowsGroup, ...tableau.rowsGroups.slice(1)],
    });
  };

  const removeLine = (idx: number) => {
    const rows = rowsGroup.rows.filter((_, i) => i !== idx);
    const newRowsGroup = { ...rowsGroup, rows };
    setTable({
      ...tableau,
      rowsGroups: [newRowsGroup, ...tableau.rowsGroups.slice(1)],
    });
  };

  const toggleComment = () => {
    setTable({ ...tableau, commentaire: !tableau.commentaire });
  };

  const [editingColIdx, setEditingColIdx] = useState<number | null>(null);
  const handleColumnTypeChange = (col: ColumnDef) => {
    if (editingColIdx === null) return;
    const cols = [...tableau.columns];
    cols[editingColIdx] = col;
    setTable({ ...tableau, columns: cols });
    setEditingColIdx(null);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse">
          <thead>
            <tr>
              <th className="p-1"></th>
              {tableau.columns.map((col, colIdx) => (
                <th key={col.id} className="p-1">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-1">
                      <Button
                        variant="icon"
                        size="micro"
                        onClick={() => setEditingColIdx(colIdx)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="icon"
                        size="micro"
                        onClick={() => removeColumn(colIdx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      className="w-40 whitespace-normal break-words"
                      value={col.label}
                      onChange={(e) => updateColumn(colIdx, e.target.value)}
                    />
                  </div>
                </th>
              ))}
              <th className="p-1">
                <Input
                  className="w-40 whitespace-normal break-words"
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
            {rowsGroup.rows.map((ligne: Row, ligneIdx: number) => (
              <tr key={ligne.id}>
                <th className="p-1">
                  <div className="flex items-center gap-2">
                    <Input
                      className="w-40 whitespace-normal break-words"
                      value={ligne.label}
                      onChange={(e) => updateLine(ligneIdx, e.target.value)}
                    />
                    <Button
                      variant="icon"
                      size="micro"
                      onClick={() => removeLine(ligneIdx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </th>
                {tableau.columns.map((col) => (
                  <td key={col.id} className="p-1">
                    <Input
                      className="pointer-events-none"
                    />
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
      </div>
      <ChoixTypeDeValeurTableau
        column={editingColIdx !== null ? tableau.columns[editingColIdx] : null}
        onClose={() => setEditingColIdx(null)}
        onChange={handleColumnTypeChange}
      />
    </div>
  );
}

export function TitleEditor({}: EditorProps) {
  return null;
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
