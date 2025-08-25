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
  let data: Record<string, Record<string, unknown>> & { commentaire?: string } =
    {};
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    data = value as Record<string, Record<string, unknown>> & {
      commentaire?: string;
    };
  }

  const renderCell = (rowId: string, col: ColumnDef) => {
    const cellValue = data[rowId]?.[col.id];
    const update = (v: unknown) => {
      const row = data[rowId] || {};
      const updatedRow = { ...row, [col.id]: v };
      const updated = { ...data, [rowId]: updatedRow };
      onChange(updated);
    };
    switch (col.valueType) {
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
        const selected = Array.isArray(cellValue)
          ? (cellValue as string[])
          : [];
        return (
          <div className="flex flex-wrap gap-2">
            {col.options?.map((opt) => {
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
      {question.tableau?.rowsGroups?.map((rowsGroup) => (
        <div key={rowsGroup.id} className="mb-4">
          {rowsGroup.title && (
            <div className="px-2 py-1 font-bold text-sm">{rowsGroup.title}</div>
          )}
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr>
                <th className="px-2 py-1"></th>
                {question.tableau?.columns?.map((col) => (
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
                  <td className="px-2 py-1 text-xs font-medium">{row.label}</td>
                  {question.tableau?.columns?.map((col) => (
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
