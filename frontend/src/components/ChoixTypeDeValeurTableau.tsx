import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { X } from 'lucide-react';
import type { ColumnDef, ValueType } from '@/types/question';

interface Props {
  column: ColumnDef | null;
  onClose: () => void;
  onChange: (col: ColumnDef) => void;
}

export default function ChoixTypeDeValeurTableau({
  column,
  onClose,
  onChange,
}: Props) {
  const [local, setLocal] = useState<ColumnDef | null>(column);

  useEffect(() => {
    setLocal(column);
  }, [column]);

  if (!column || !local) return null;

  const updateOption = (idx: number, value: string) => {
    const opts = [...(local.options || [])];
    opts[idx] = value;
    setLocal({ ...local, options: opts });
  };

  const removeOption = (idx: number) => {
    const opts = (local.options || []).filter((_, i) => i !== idx);
    setLocal({ ...local, options: opts });
  };

  const addOption = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLocal({ ...local, options: [...(local.options || []), trimmed] });
  };

  return (
    <Dialog open={!!column} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Type de valeur</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={local.valueType}
              onValueChange={(v) =>
                setLocal({
                  ...local,
                  valueType: v as ValueType,
                  options: ['choice', 'multi-choice'].includes(v)
                    ? local.options || []
                    : undefined,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texte</SelectItem>
                <SelectItem value="number">Nombre</SelectItem>
                <SelectItem value="bool">Case à cocher</SelectItem>
                <SelectItem value="choice">Liste déroulante</SelectItem>
                <SelectItem value="multi-choice">Choix multiples</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(local.valueType === 'choice' ||
            local.valueType === 'multi-choice') && (
            <div className="space-y-2">
              {local.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(idx)}
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
          )}
          <div className="flex justify-end">
            <Button
              onClick={() => {
                onChange(local);
                onClose();
              }}
            >
              Valider
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
