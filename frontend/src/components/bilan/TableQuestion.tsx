import * as React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown } from 'lucide-react';
import type { Question, ColumnDef } from '@/types/question';
import { Chip } from './Chip';

const FIELD_BASE =
  'rounded-lg border border-gray-300 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none';
const FIELD_DENSE = 'h-9 px-3';

interface TableQuestionProps {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function TableQuestion({
  question,
  value,
  onChange,
}: TableQuestionProps) {
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  
  let data: Record<string, Record<string, unknown>> & { commentaire?: string } =
    {};
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    data = value as Record<string, Record<string, unknown>> & {
      commentaire?: string;
    };
  }

  const getColumnWidth = (col: ColumnDef) => {
    switch (col.valueType) {
      case 'bool':
        return 'w-16'; // Juste pour le checkbox
      case 'choice':
        return 'max-w-32'; // Largeur maximale pour les listes déroulantes
      case 'number':
        return 'max-w-24'; // Largeur maximale pour les nombres
      case 'image':
        return 'max-w-40'; // Largeur maximale pour les URLs d'images
      case 'multi-choice':
      case 'multi-choice-row':
        return 'min-w-48'; // Largeur minimale pour les choix multiples
      case 'text':
        return 'min-w-32'; // Largeur minimale pour le texte, mais peut s'agrandir
      default:
        return 'min-w-32'; // Largeur minimale par défaut
    }
  };

  const renderChips = (opts: string[], selected: string[], update: (v: string[]) => void, maxVisible = 3) => {
    const visibleOpts = opts.slice(0, maxVisible);
    const hiddenOpts = opts.slice(maxVisible);
    const rowKey = `chips-${opts.join('-')}`;
    const isExpanded = expandedRows[rowKey];

    return (
      <div className="space-y-1">
        <div className="flex flex-wrap gap-1">
          {visibleOpts.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <Chip
                key={opt}
                selected={isSelected}
                onClick={() => {
                  const newSelected = isSelected
                    ? selected.filter((o) => o !== opt)
                    : [...selected, opt];
                  update(newSelected);
                }}
              >
                {opt}
              </Chip>
            );
          })}
          {hiddenOpts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedRows(prev => ({ ...prev, [rowKey]: !prev[rowKey] }))}
              className="h-7 px-2 text-xs ml-0"
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Moins
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  +{hiddenOpts.length}
                </>
              )}
            </Button>
          )}
        </div>
        {isExpanded && hiddenOpts.length > 0 && (
          <div className="flex flex-wrap gap-1 pl-2 border-l-2 border-gray-200">
            {hiddenOpts.map((opt) => {
              const isSelected = selected.includes(opt);
              return (
                <Chip
                  key={opt}
                  selected={isSelected}
                  onClick={() => {
                    const newSelected = isSelected
                      ? selected.filter((o) => o !== opt)
                      : [...selected, opt];
                    update(newSelected);
                  }}
                >
                  {opt}
                </Chip>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderCell = (rowId: string, col: ColumnDef) => {
    const cellValue = data[rowId]?.[col.id];
    const update = (v: unknown) => {
      const row = data[rowId] || {};
      const updatedRow = { ...row, [col.id]: v };
      const updated = { ...data, [rowId]: updatedRow };
      onChange(updated);
    };
    switch (col.valueType) {
      case 'text':
        return (
          <Input
            size="sm"
            value={(cellValue as string) ?? ''}
            onChange={(e) => update(e.target.value)}
            className={`${FIELD_BASE} ${FIELD_DENSE} min-w-32 w-full`}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            size="sm"
            value={(cellValue as number | string | undefined) ?? ''}
            onChange={(e) =>
              update(e.target.value === '' ? '' : Number(e.target.value))
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
      case 'multi-choice':
      case 'multi-choice-row':
        const selected = Array.isArray(cellValue)
          ? (cellValue as string[])
          : [];
        const opts =
          col.valueType === 'multi-choice-row'
            ? col.rowOptions?.[rowId] || []
            : col.options || [];
        return renderChips(opts, selected, update);
      case 'bool':
        return (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500/40"
              checked={Boolean(cellValue)}
              onChange={(e) => update(e.target.checked)}
            />
          </div>
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
            className={`${FIELD_BASE} ${FIELD_DENSE} min-w-32 w-full`}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {question.tableau?.rowsGroups?.map((rowsGroup) => (
        <div key={rowsGroup.id} className="mb-4">
          {rowsGroup.title && (
            <div className="px-2 py-1 font-bold text-sm">{rowsGroup.title}</div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left max-w-48 w-48">
                    <div className="text-xs font-medium">Lignes</div>
                  </th>
                  {question.tableau?.columns?.map((col) => (
                    <th
                      key={col.id}
                      className={`px-2 py-1 text-xs font-medium text-left ${getColumnWidth(col)}`}
                    >
                      <div className="truncate" title={col.label}>
                        {col.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowsGroup.rows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-2 py-1 text-xs font-medium max-w-48 w-48">
                      <div className="truncate" title={row.label}>
                        {row.label}
                      </div>
                    </td>
                    {question.tableau?.columns?.map((col) => (
                      <td key={col.id} className={`px-2 py-1 ${getColumnWidth(col)}`}>
                        {renderCell(row.id, col)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {question.tableau?.commentaire && (
        <div>
          <Label className="text-sm font-medium">Commentaire</Label>
          <Textarea
            value={data.commentaire || ''}
            onChange={(e) => onChange({ ...data, commentaire: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
