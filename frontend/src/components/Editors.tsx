import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type {
  Question,
  SurveyTable,
  ColumnDef,
  Row,
  RowsGroup,
  TitlePreset,
} from '@/types/question';
import { DEFAULT_TITLE_PRESETS, CUSTOM_PRESET_ID } from '@/types/question';
import { X, Settings, GripVertical, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ChoixTypeDeValeurTableau from './ChoixTypeDeValeurTableau';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@radix-ui/react-alert-dialog';
import {
  AlertDialogCancel,
  AlertDialogPortal,
  AlertDialogOverlay,
} from './ui/alert-dialog';
import AstInsertModal from './AstInsertModal';
import TitleStyleModale from './TitleStyleModale';

export type EditorProps = {
  q: Question;
  onPatch: (p: Partial<Question>) => void;
  isReadOnly?: boolean;
  getAstSnippet?: (id?: string | null) => string | null | undefined;
  saveAstSnippet?: (
    content: string,
    previousId?: string | null,
  ) => string | null;
  deleteAstSnippet?: (id: string) => void;
};

export function NotesEditor({}: EditorProps) {
  return (
    <div className="space-y-4">
      <div className="w-full rounded px-3 py-2 border-b border-dotted border-gray-200 text-gray-600 text-sm">
        Réponse (prise de notes)
      </div>
    </div>
  );
}

export function MultiChoiceEditor({ q, onPatch, isReadOnly }: EditorProps) {
  const options = ('options' in q && q.options) || [];
  React.useEffect(() => {
    if (isReadOnly) return;
    if (q.commentaire === undefined) {
      onPatch({ commentaire: true } as Partial<Question>);
    }
  }, [q.commentaire, onPatch, isReadOnly]);
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
  const toggleComment = () => {
    onPatch({ commentaire: !q.commentaire } as Partial<Question>);
  };
  return (
    <div className="space-y-4">
      <div>
        <div className="space-y-2">
          {options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-2">
              <Input
                className="text-sm"
                value={option}
                onChange={(e) => updateOption(optionIndex, e.target.value)}
                disabled={isReadOnly}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeOption(optionIndex)}
                disabled={isReadOnly}
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
            disabled={isReadOnly}
          />
        </div>
      </div>
      <div className="space-y-2">
        {q.commentaire ? (
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
              disabled={isReadOnly}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleComment}
            disabled={isReadOnly}
          >
            + Ajouter une zone de commentaire
          </Button>
        )}
      </div>
    </div>
  );
}

export function ScaleEditor({}: EditorProps) {
  return (
    <div className="space-y-4">{/* Placeholder for scale configuration */}</div>
  );
}

export function TableEditor({
  q,
  onPatch,
  isReadOnly,
  getAstSnippet,
  saveAstSnippet,
  deleteAstSnippet,
}: EditorProps) {
  const genId = () => Math.random().toString(36).slice(2);
  const [groupToDelete, setGroupToDelete] = React.useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = React.useState<string | null>(
    null,
  );
  const [isAstModalOpen, setIsAstModalOpen] = React.useState(false);
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
        crInsert: false,
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
      valueType: 'number',
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
    const group = tableau.rowsGroups.find((g) => g.id === groupId);
    const rowId = group?.rows[idx]?.id;
    const updatedRowsGroups = tableau.rowsGroups.map((g) =>
      g.id === groupId ? { ...g, rows: g.rows.filter((_, i) => i !== idx) } : g,
    );
    const updatedCols = rowId
      ? tableau.columns.map((c) =>
          c.valueType === 'multi-choice-row'
            ? {
                ...c,
                rowOptions: Object.fromEntries(
                  Object.entries(c.rowOptions || {}).filter(
                    ([rid]) => rid !== rowId,
                  ),
                ),
              }
            : c,
        )
      : tableau.columns;
    setTable({
      ...tableau,
      rowsGroups: updatedRowsGroups,
      columns: updatedCols,
    });
  };

  const toggleComment = () => {
    setTable({ ...tableau, commentaire: !tableau.commentaire });
  };

  const toggleAnchorInsert = () => {
    if (tableau.crInsert) {
      if (tableau.crAstId && deleteAstSnippet) {
        deleteAstSnippet(tableau.crAstId);
      }
      setTable({
        ...tableau,
        crInsert: false,
        crTableId: undefined,
        crAstId: undefined,
      });
      return;
    }
    // Use the question id to ensure a unique default anchor id per table
    const fallbackId = `T-${q.id}`;
    const nextId =
      tableau.crTableId && tableau.crTableId.trim().length > 0
        ? tableau.crTableId.trim()
        : fallbackId;
    setTable({ ...tableau, crInsert: true, crTableId: nextId });
  };

  const updateAnchorId = (value: string) => {
    setTable({ ...tableau, crTableId: value });
  };

  const [editingColIdx, setEditingColIdx] = React.useState<number | null>(null);

  const colDragIdx = React.useRef<number | null>(null);
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

  const rowDrag = React.useRef<{ groupId: string; index: number } | null>(null);
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

  const removeGroup = (groupId: string) => {
    setTable({
      ...tableau,
      rowsGroups: tableau.rowsGroups.filter((g) => g.id !== groupId),
    });
  };

  const updateGroup = (groupId: string, title: string) => {
    setTable({
      ...tableau,
      rowsGroups: tableau.rowsGroups.map((g) =>
        g.id === groupId ? { ...g, title } : g,
      ),
    });
  };

  const tablePathOptions = React.useMemo(() => {
    const options: { path: string; label: string }[] = [];
    const columns = tableau.columns ?? [];

    if (columns.length > 0) {
      for (const group of tableau.rowsGroups ?? []) {
        for (const row of group.rows ?? []) {
          const rowLabel = row.label?.trim() || row.id;
          for (const column of columns) {
            const colLabel = column.label?.trim() || column.id;
            options.push({
              path: `${q.id}.${row.id}.${column.id}`,
              label: `${rowLabel}.${colLabel}`,
            });
          }
        }
      }
    }

    if (tableau.commentaire) {
      options.push({
        path: `${q.id}.commentaire`,
        label: 'Commentaire',
      });
    }

    return options;
  }, [q.id, tableau.columns, tableau.rowsGroups, tableau.commentaire]);

  return (
    <>
      <div className="space-y-4 text-sm">
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse text-sm">
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
                      <div className="flex items-center gap-1">
                        <Button
                          variant="icon"
                          size="sm"
                          aria-label="Déplacer la colonne"
                          draggable={!isReadOnly}
                          onDragStart={() => handleColDragStart(colIdx)}
                          onDragEnd={handleColDragEnd}
                          className="cursor-move p-1"
                          disabled={isReadOnly}
                        >
                          <GripVertical className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="icon"
                          size="sm"
                          onClick={() => setEditingColIdx(colIdx)}
                          disabled={isReadOnly}
                        >
                          <span className="flex items-center gap-1 text-sm font-medium">
                            Type
                          </span>
                        </Button>
                        {tableau.crInsert && (
                          <Button
                            variant="icon"
                            size="sm"
                            onClick={() => setEditingColIdx(colIdx)}
                            disabled={isReadOnly}
                          >
                            <span className="flex items-center gap-1 text-sm font-medium">
                              Couleur
                            </span>
                          </Button>
                        )}
                        <Button
                          variant="icon"
                          size="micro"
                          onClick={() => removeColumn(colIdx)}
                          disabled={isReadOnly}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        className="w-40 whitespace-normal break-words text-sm"
                        value={col.label}
                        onChange={(e) => updateColumn(colIdx, e.target.value)}
                        disabled={isReadOnly}
                      />
                    </div>
                  </th>
                ))}
                <th className="p-1 align-bottom">
                  <Input
                    className="w-40 whitespace-normal break-words placeholder:text-accent-500 text-sm"
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
                    disabled={isReadOnly}
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
                      className="p-1 font-bold flex justify-between items-center text-sm"
                    >
                      {editingGroupId === group.id ? (
                        <Input
                          autoFocus
                          className="w-40"
                          defaultValue={group.title}
                          onBlur={(e) => {
                            updateGroup(group.id, e.currentTarget.value.trim());
                            setEditingGroupId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateGroup(
                                group.id,
                                e.currentTarget.value.trim(),
                              );
                              setEditingGroupId(null);
                            }
                          }}
                          disabled={isReadOnly}
                        />
                      ) : (
                        <span
                          onClick={() => {
                            if (!isReadOnly) setEditingGroupId(group.id);
                          }}
                          className="cursor-text"
                        >
                          {group.title || 'Groupe sans titre'}
                        </span>
                      )}
                      <Button
                        variant="icon"
                        size="micro"
                        onClick={() => setGroupToDelete(group.id)}
                        disabled={isReadOnly}
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
                            draggable={!isReadOnly}
                            onDragStart={() =>
                              handleRowDragStart(group.id, ligneIdx)
                            }
                            onDragEnd={handleRowDragEnd}
                            className="cursor-move p-1"
                            disabled={isReadOnly}
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                          <Input
                            className="w-40 whitespace-normal break-words text-sm"
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
                            disabled={isReadOnly}
                          />
                          <Button
                            variant="icon"
                            size="micro"
                            onClick={() => removeLine(group.id, ligneIdx)}
                            disabled={isReadOnly}
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
                        className="w-40 placeholder:text-accent-500 text-sm"
                        placeholder="+ Nouvelle ligne"
                        onKeyDown={(e) => {
                          if (
                            e.key === 'Enter' &&
                            e.currentTarget.value.trim()
                          ) {
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
                        disabled={isReadOnly}
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
              className="w-50 placeholder:text-accent-500 text-sm"
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
              disabled={isReadOnly}
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
                disabled={isReadOnly}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleComment}
              disabled={isReadOnly}
            >
              + Ajouter une zone de commentaire
            </Button>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <input
              id={`table-cr-toggle-${q.id}`}
              type="checkbox"
              checked={Boolean(tableau.crInsert)}
              onChange={toggleAnchorInsert}
              disabled={isReadOnly}
            />
            <label
              htmlFor={`table-cr-toggle-${q.id}`}
              className="text-sm text-gray-700"
            >
              Cocher pour insérer le tableau dans le bilan lors de la rédaction
            </label>
            {tableau.crInsert && saveAstSnippet && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => setIsAstModalOpen(true)}
                disabled={isReadOnly}
              >
                <Settings className="h-4 w-4 mr-1" />
                Customiser le format du tableau
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Le tableau sera inséré directement dans le bilan avec les valeurs
            que vous avez remplie lors de la rédaction.
          </p>
          {tableau.crInsert &&
            tableau.crAstId &&
            getAstSnippet?.(tableau.crAstId ?? null) && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Un format personnalisé est enregistré pour cette insertion.
                </p>
              </div>
            )}
        </div>
        <ChoixTypeDeValeurTableau
          column={
            editingColIdx !== null ? tableau.columns[editingColIdx] : null
          }
          rows={tableau.rowsGroups.flatMap((g) => g.rows)}
          onClose={() => setEditingColIdx(null)}
          onChange={handleColumnTypeChange}
          crInsert={tableau.crInsert}
        />
      </div>
      <AstInsertModal
        open={isAstModalOpen}
        onOpenChange={setIsAstModalOpen}
        initialAst={
          tableau.crAstId
            ? (getAstSnippet?.(tableau.crAstId ?? null) ?? undefined)
            : undefined
        }
        templateKey={`table-cr-insert-${q.id}`}
        onSave={(serializedAst) => {
          if (!saveAstSnippet) return;
          const nextId = saveAstSnippet(serializedAst, tableau.crAstId);
          if (!nextId) return;
          setTable({ ...tableau, crAstId: nextId });
        }}
        onDelete={
          deleteAstSnippet && tableau.crAstId
            ? () => {
                try {
                  deleteAstSnippet(tableau.crAstId!);
                } finally {
                  setTable({ ...tableau, crAstId: undefined });
                }
              }
            : undefined
        }
        pathOptions={tablePathOptions}
      />
      <AlertDialog open={!!groupToDelete} onOpenChange={setGroupToDelete}>
        {/* on peut utiliser un trigger si on veut un bouton générique */}
        <AlertDialogPortal>
          {/* 1. overlay plein écran */}
          <AlertDialogOverlay className="fixed inset-0 bg-black/40 z-40" />

          {/* 2. contenu modale centré */}
          <AlertDialogContent
            className="
                fixed 
                top-1/2 left-1/2 
                transform -translate-x-1/2 -translate-y-1/2
                bg-white rounded-lg p-6
                shadow-lg z-50
              "
          >
            <AlertDialogTitle className="text-lg font-bold text-sm">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 mb-4 text-sm text-gray-600">
              Ce groupe contient peut-être des lignes. Voulez-vous vraiment le
              supprimer ?
            </AlertDialogDescription>

            <div className="flex justify-end gap-2">
              <AlertDialogCancel asChild>
                <Button variant="outline">Annuler</Button>
              </AlertDialogCancel>
              <AlertDialogAction
                asChild
                onClick={() => {
                  if (groupToDelete) removeGroup(groupToDelete);
                  setGroupToDelete(null);
                }}
              >
                <Button variant="destructive">Supprimer</Button>
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  );
}

const TITLE_SAMPLE_TEXT = "Titre d'exemple";

type TitlePresetPreviewProps = {
  preset: TitlePreset;
  sampleText?: string;
  showLabel?: boolean;
  className?: string;
};

type TitlePresetDropdownProps = {
  presets: TitlePreset[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onOpenCustom?: () => void;
  // When a custom style is active, show its preview in the trigger
  overrideFormat?: TitlePreset['format'];
};

function getHeadingSizeClass(level?: number) {
  switch (level) {
    case 1:
      return 'text-3xl';
    case 2:
      return 'text-2xl';
    case 3:
      return 'text-xl';
    case 4:
      return 'text-lg';
    case 5:
      return 'text-base';
    case 6:
      return 'text-sm';
    default:
      return 'text-2xl';
  }
}

function getAlignmentClass(align?: TitlePreset['format']['align']) {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    case 'justify':
      return 'text-justify';
    default:
      return 'text-left';
  }
}

function getCaseClass(caseOption?: TitlePreset['format']['case']) {
  switch (caseOption) {
    case 'uppercase':
      return 'uppercase';
    case 'capitalize':
      return 'capitalize';
    case 'lowercase':
      return 'lowercase';
    default:
      return undefined;
  }
}

function getTextClasses(format: TitlePreset['format']) {
  const baseSize =
    format.kind === 'heading' ? getHeadingSizeClass(format.level) : 'text-base';

  return cn(
    'block leading-tight text-gray-900',
    baseSize,
    getAlignmentClass(format.align),
    getCaseClass(format.case),
    format.bold && 'font-semibold',
    format.italic && 'italic',
    format.underline && 'underline',
  );
}

function buildSampleText(sampleText: string, format: TitlePreset['format']) {
  const segments: string[] = [];
  if (format.prefix) segments.push(format.prefix);
  segments.push(sampleText);
  if (format.suffix) segments.push(format.suffix);
  return segments.join('');
}

function sidesToAttr(
  sides?: 'all' | Array<'top' | 'right' | 'bottom' | 'left'>,
): string {
  if (!sides || sides === 'all') return 'top right bottom left';
  return sides.join(' ');
}

function paddingToStyle(
  padding?:
    | number
    | { top?: number; right?: number; bottom?: number; left?: number },
): React.CSSProperties | undefined {
  if (padding == null) return undefined;
  if (typeof padding === 'number') {
    return { padding: `${padding}px` };
  }
  return {
    paddingTop: padding.top != null ? `${padding.top}px` : undefined,
    paddingRight: padding.right != null ? `${padding.right}px` : undefined,
    paddingBottom: padding.bottom != null ? `${padding.bottom}px` : undefined,
    paddingLeft: padding.left != null ? `${padding.left}px` : undefined,
  };
}

function TitlePresetPreview({
  preset,
  sampleText = TITLE_SAMPLE_TEXT,
  showLabel = true,
  className,
}: TitlePresetPreviewProps) {
  const { format } = preset;
  const textClasses = getTextClasses(preset.format);
  const displayText = buildSampleText(sampleText, preset.format);
  // Inline style to reflect numeric font size and text color
  const style: React.CSSProperties = {};
  if (typeof format.fontSize === 'number') {
    style.fontSize = `${format.fontSize}pt`;
  } else if (typeof format.fontSize === 'string' && format.fontSize.trim()) {
    style.fontSize = format.fontSize.trim();
  }
  const colorPref = (format as any)?.fontColor ?? (format as any)?.textColor;
  if (typeof colorPref === 'string' && colorPref.trim()) {
    style.color = colorPref.trim();
  }

  const inner =
    preset.format.kind === 'list-item' ? (
      <div className="flex items-start gap-2 text-left">
        <span className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
        <span className={textClasses} style={style}>
          {displayText}
        </span>
      </div>
    ) : (
      <span className={textClasses} style={style}>
        {displayText}
      </span>
    );

  const decor = format.decor;
  const content = decor ? (
    <div
      className={cn('bp-decor bp-border w-full', {
        // fallback: si pas de sides spécifiques, on laisse le style de base
      })}
      data-bp-weight={decor.weight ?? 'thin'}
      data-bp-color={decor.color ?? 'black'}
      data-bp-fill={decor.fill?.kind ?? 'none'}
      data-bp-fill-token={decor.fill?.token}
      // NB: si fill.kind === 'custom', on passe la couleur en inline style
      style={{
        borderRadius: decor.radius ? `${decor.radius}px` : undefined,
        // couleur de fond custom si demandé
        ...(decor.fill?.kind === 'custom' && decor.fill.color
          ? { backgroundColor: decor.fill.color, color: undefined }
          : {}),
      }}
    >
      {inner}
    </div>
  ) : (
    inner
  );

  return (
    <div className={cn('flex w-full flex-col gap-1', className)}>
      {content}
      {showLabel ? (
        <span className="text-xs text-gray-500">{preset.label}</span>
      ) : null}
    </div>
  );
}

function TitlePresetDropdown({
  presets,
  value: propValue,
  onChange,
  disabled,
  onOpenCustom,
  overrideFormat,
}: TitlePresetDropdownProps) {
  const selectedPreset = React.useMemo(() => {
    if (!presets.length) return undefined;
    const currentId = propValue ?? presets[0]?.id;
    return presets.find((preset) => preset.id === currentId) ?? presets[0];
  }, [presets, propValue]);

  // Use the raw prop value for selection state so no preset is
  // checked when a custom style is active (CUSTOM_PRESET_ID).
  const value = propValue;
  // If a custom format override is active, synthesize a pseudo-preset for preview
  const displayPreset: TitlePreset | undefined = React.useMemo(() => {
    if (overrideFormat) {
      return {
        id: '__custom__',
        label: 'Style personnalisé',
        format: overrideFormat,
      };
    }
    return selectedPreset;
  }, [overrideFormat, selectedPreset]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-auto w-full items-start justify-between gap-2 px-3 py-2 text-left"
          disabled={disabled}
        >
          <div className="flex-1 text-left">
            {displayPreset ? (
              <TitlePresetPreview preset={displayPreset} className="flex-1" />
            ) : (
              <span className="text-sm text-gray-500">
                Aucun preset disponible
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-80">
        <div className="max-h-80 overflow-y-auto">
          {presets.map((preset) => (
            <DropdownMenuItem
              key={preset.id}
              className="items-start"
              onSelect={(e) => {
                if (disabled) {
                  e.preventDefault();
                  return;
                }
                onChange(preset.id);
              }}
            >
              <Check
                className={cn(
                  'h-4 w-4 text-primary-600 transition-opacity',
                  value === preset.id ? 'opacity-100' : 'opacity-0',
                )}
              />
              <TitlePresetPreview preset={preset} className="flex-1" />
            </DropdownMenuItem>
          ))}
        </div>
        <div className="border-t my-1" />
        <DropdownMenuItem
          className="items-start font-medium text-primary-700"
          onSelect={(e) => {
            if (disabled) {
              e.preventDefault();
              return;
            }
            e.preventDefault();
            onOpenCustom?.();
          }}
        >
          <Check
            className={cn(
              'h-4 w-4 text-primary-600 transition-opacity',
              overrideFormat || propValue === CUSTOM_PRESET_ID
                ? 'opacity-100'
                : 'opacity-0',
            )}
          />
          <span>Style personnalisé …</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TitleEditor({ q, onPatch, isReadOnly }: EditorProps) {
  const presets = React.useMemo(() => Object.values(DEFAULT_TITLE_PRESETS), []);
  const defaultPresetId = 't12-underline';

  const selectedPreset = React.useMemo(() => {
    const currentId = q.titrePresetId ?? defaultPresetId;
    return presets.find((p) => p.id === currentId) ?? presets[0];
  }, [presets, q.titrePresetId]);

  const selectedId = React.useMemo(() => {
    if (q.titreFormatOverride) return CUSTOM_PRESET_ID;
    return q.titrePresetId ?? defaultPresetId;
  }, [q.titreFormatOverride, q.titrePresetId]);

  const [customOpen, setCustomOpen] = React.useState(false);
  const [customInitial, setCustomInitial] = React.useState<
    TitlePreset['format'] | undefined
  >(undefined);

  React.useEffect(() => {
    if (!defaultPresetId || isReadOnly) return;
    const currentId = q.titrePresetId?.trim();
    const hasOverride = !!q.titreFormatOverride;
    if (!currentId && !hasOverride) {
      onPatch({ titrePresetId: defaultPresetId } as Partial<Question>);
    }
  }, [
    defaultPresetId,
    q.titrePresetId,
    q.titreFormatOverride,
    onPatch,
    isReadOnly,
  ]);

  const handleChange = React.useCallback(
    (value: string) => {
      if (value === CUSTOM_PRESET_ID) return; // selection is driven via the custom modal
      onPatch({
        titrePresetId: value,
        titreFormatOverride: undefined,
      } as Partial<Question>);
    },
    [onPatch],
  );

  const openCustom = React.useCallback(() => {
    const initial = q.titreFormatOverride ??
      selectedPreset?.format ?? {
        kind: 'paragraph',
        fontSize: 12,
        bold: true,
        align: 'left',
        case: 'none',
      };
    setCustomInitial(initial);
    setCustomOpen(true);
  }, [q.titreFormatOverride, selectedPreset]);

  const handleCustomSave = React.useCallback(
    (format: TitlePreset['format']) => {
      onPatch({
        titrePresetId: CUSTOM_PRESET_ID,
        titreFormatOverride: format,
      } as Partial<Question>);
      setCustomOpen(false);
    },
    [onPatch],
  );

  return (
    <div className="space-y-2 text-sm">
      <label className="block text-gray-700">Format du titre</label>
      <TitlePresetDropdown
        presets={presets}
        value={selectedId}
        onChange={handleChange}
        disabled={isReadOnly}
        onOpenCustom={isReadOnly ? undefined : openCustom}
        overrideFormat={q.titreFormatOverride}
      />
      <TitleStyleModale
        open={customOpen}
        initial={customInitial}
        onCancel={() => setCustomOpen(false)}
        onSave={handleCustomSave}
      />
    </div>
  );
}

export const EDITORS: Record<
  Question['type'],
  (props: EditorProps) => JSX.Element
> = {
  notes: NotesEditor,
  'choix-multiple': MultiChoiceEditor,
  'choix-unique': MultiChoiceEditor,
  echelle: ScaleEditor,
  tableau: TableEditor,
  titre: TitleEditor,
};
