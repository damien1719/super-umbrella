import React from 'react';
import { useState, useRef } from 'react';
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
import { X, Settings, GripVertical } from 'lucide-react';
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
  const tableau: SurveyTable & { commentaire?: boolean } = q.tableau
    ? 'rowsGroups' in q.tableau
      ? q.tableau
      : {
          ...(q.tableau as SurveyTable),
          rowsGroups: (q.tableau as { sections?: RowsGroup[] }).sections || [],
        }
    : {
        columns: [],
        rowsGroups: [{ id: genId(), title: '', rows: [] }],
      };
  const lastIndex = tableau.rowsGroups.length - 1;
  const rowsGroup: RowsGroup = tableau.rowsGroups[lastIndex] || {
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

  const addLine = (groupId: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const newRow: Row = { id: genId(), label: trimmed };
    setTable({
      ...tableau,
      rowsGroups: tableau.rowsGroups.map((g) =>
        g.id === groupId ? { ...g, rows: [...g.rows, newRow] } : g,
      ),
    });
  };

  const updateLine = (groupId: string, idx: number, value: string) => {
    setTable({
      ...tableau,
      rowsGroups: tableau.rowsGroups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              rows: g.rows.map((r, i) =>
                i === idx ? { ...r, label: value } : r,
              ),
            }
          : g,
      ),
    });
  };

  const removeLine = (groupId: string, idx: number) => {
    setTable({
      ...tableau,
      rowsGroups: tableau.rowsGroups.map((g) =>
        g.id === groupId
          ? { ...g, rows: g.rows.filter((_, i) => i !== idx) }
          : g,
      ),
    });
  };

  const toggleComment = () => {
    setTable({ ...tableau, commentaire: !tableau.commentaire });
  };

  const [editingColIdx, setEditingColIdx] = useState<number | null>(null);

  const colDragIdx = useRef<number | null>(null);
  const handleColDragStart = (idx: number) => {
    colDragIdx.current = idx;
  };
  const handleColDragEnd = () => {
    colDragIdx.current = null;
  };
  const handleColDrop = (idx: number) => {
    if (colDragIdx.current === null || colDragIdx.current === idx) {
      colDragIdx.current = null;
      return;
    }
    const cols = [...tableau.columns];
    const [col] = cols.splice(colDragIdx.current, 1);
    cols.splice(idx, 0, col);
    setTable({ ...tableau, columns: cols });
    colDragIdx.current = null;
  };

  const rowDrag = useRef<{ groupId: string; index: number } | null>(null);
  const handleRowDragStart = (groupId: string, idx: number) => {
    rowDrag.current = { groupId, index: idx };
  };
  const handleRowDragEnd = () => {
    rowDrag.current = null;
  };
  const handleRowDrop = (groupId: string, idx: number) => {
    if (!rowDrag.current) return;
    const { groupId: fromGroupId, index: fromIdx } = rowDrag.current;
    if (fromGroupId === groupId && fromIdx === idx) {
      rowDrag.current = null;
      return;
    }
    const groups = tableau.rowsGroups.map((g) => ({
      ...g,
      rows: [...g.rows],
    }));
    const fromGroup = groups.find((g) => g.id === fromGroupId);
    const toGroup = groups.find((g) => g.id === groupId);
    if (!fromGroup || !toGroup) {
      rowDrag.current = null;
      return;
    }
    const [row] = fromGroup.rows.splice(fromIdx, 1);
    let insertIdx = idx;
    if (fromGroupId === groupId && fromIdx < idx) insertIdx -= 1;
    toGroup.rows.splice(insertIdx, 0, row);
    setTable({ ...tableau, rowsGroups: groups });
    rowDrag.current = null;
  };

  const handleColumnTypeChange = (col: ColumnDef) => {
    if (editingColIdx === null) return;
    const cols = [...tableau.columns];
    cols[editingColIdx] = col;
    setTable({ ...tableau, columns: cols });
    setEditingColIdx(null);
  };

  const addGroup = () => {
    const newGroup: RowsGroup = { id: genId(), title: '', rows: [] };
    setTable({ ...tableau, rowsGroups: [...tableau.rowsGroups, newGroup] });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse">
          <thead>
            <tr>
              <th className="p-1"></th>
              {tableau.columns.map((col, colIdx) => (
                <th
                  key={col.id}
                  className="p-1"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleColDrop(colIdx)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-1">
                      <button
                        aria-label="Déplacer la colonne"
                        draggable
                        onDragStart={() => handleColDragStart(colIdx)}
                        onDragEnd={handleColDragEnd}
                        className="cursor-move p-1"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <Button
                        variant="icon"
                        size="micro"
                        onClick={() => setEditingColIdx(colIdx)}
                      >
                        <Settings className="h-4 w-4" />
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
                  className="w-40 placeholder:text-accent-500"
                  placeholder="+ Nouvelle colonne"
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
            {tableau.rowsGroups.map((group) => (
              <React.Fragment key={group.id}>
                {/* ligne de titre de groupe (fusionnant toutes les colonnes) */}
                <tr
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleRowDrop(group.id, 0)}
                >
                  <td
                    colSpan={tableau.columns.length + 1}
                    className="p-1 font-bold"
                  >
                    {group.title || 'Groupe sans titre'}
                  </td>
                </tr>
                {group.rows.map((ligne: Row, ligneIdx: number) => (
                  <tr
                    key={ligne.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleRowDrop(group.id, ligneIdx)}
                  >
                    <th className="p-1">
                      <div className="flex items-center gap-2">
                        <button
                          aria-label="Déplacer la ligne"
                          draggable
                          onDragStart={() =>
                            handleRowDragStart(group.id, ligneIdx)
                          }
                          onDragEnd={handleRowDragEnd}
                          className="cursor-move p-1"
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <Input
                          className="w-40 whitespace-normal break-words"
                          value={ligne.label}
                          onChange={(e) =>
                            updateLine(group.id, ligneIdx, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              updateLine(
                                group.id,
                                ligneIdx,
                                e.currentTarget.value,
                              );
                              e.currentTarget.blur();
                            }
                          }}
                          onBlur={(e) =>
                            updateLine(
                              group.id,
                              ligneIdx,
                              e.currentTarget.value,
                            )
                          }
                        />
                        <Button
                          variant="icon"
                          size="micro"
                          onClick={() => removeLine(group.id, ligneIdx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                    {tableau.columns.map((col) => (
                      <td key={col.id} className="p-1">
                        <Input className="pointer-events-none" />
                      </td>
                    ))}
                    <td className="p-1"></td>
                  </tr>
                ))}
              <tr>
                <th className="p-1">
                  <Input
                    className="w-40 placeholder:text-accent-500"
                    placeholder="+ Nouvelle ligne"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        addLine(group.id, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      if (e.currentTarget.value.trim()) {
                        addLine(group.id, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </th>
            </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {/* **** NOUVEAU GROUPE DE LIGNES **** */}
        <div className="p-1">
           <Input
            className="w-50 placeholder:text-accent-500"
            placeholder="+ Nouveau groupe de ligne"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                addGroup(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            onBlur={(e) => {
              if (e.currentTarget.value.trim()) {
                addGroup(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </div>
      <div className="space-y-2">
        {tableau.commentaire ? (
          <div className="flex flex-row items-center gap-2">

            <div className="p-2 border border-wood-200 rounded">
              <p className="text-sm text-gray-500 mb-1">
                La zone de commentaire sera disponible lors de la saisie des
                données
              </p>
            </div>
            <Button
              variant="icon"
              size="sm"
              onClick={toggleComment}
            >
              <X className="h-4 w-4"  />
            </Button>
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
