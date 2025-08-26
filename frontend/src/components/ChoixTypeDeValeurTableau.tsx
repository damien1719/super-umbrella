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
import { X, Copy, ClipboardPaste } from 'lucide-react';
import type { ColumnDef, ValueType, Row } from '@/types/question';

interface Props {
  column: ColumnDef | null;
  rows: Row[];
  onClose: () => void;
  onChange: (col: ColumnDef) => void;
}

export default function ChoixTypeDeValeurTableau({
  column,
  rows,
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
      <DialogContent className="max-h-[80vh] w-full max-w-lg overflow-y-auto">
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
                  rowOptions:
                    v === 'multi-choice-row'
                      ? local.rowOptions || {}
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
                <SelectItem value="multi-choice-row">
                  Choix multiples par ligne
                </SelectItem>
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
          {local.valueType === 'multi-choice-row' && (
            <div className="space-y-4">
              {rows.map((row) => (
                <div key={row.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{row.label}</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            const options = text
                              .split(',')
                              .map(opt => opt.trim().replace(/^"|"$/g, '').replace(/\n/g, ' ').trim())
                              .filter(opt => opt.length > 0);
                            
                            if (options.length > 0) {
                              const current = local.rowOptions?.[row.id] || [];
                              setLocal({
                                ...local,
                                rowOptions: {
                                  ...(local.rowOptions || {}),
                                  [row.id]: [...current, ...options],
                                },
                              });
                            }
                          } catch (error) {
                            console.error('Erreur lors de la lecture du presse-papiers:', error);
                          }
                        }}
                        title="Coller des options depuis le presse-papiers"
                        className="h-8 w-8 p-0"
                      >
                        <ClipboardPaste className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentOptions = local.rowOptions?.[row.id] || [];
                          if (currentOptions.length > 0) {
                            const optionsText = currentOptions
                              .map(opt => `"${opt}"`)
                              .join(',\n        ');
                            navigator.clipboard.writeText(optionsText);
                          }
                        }}
                        title="Copier les options au format texte"
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {(local.rowOptions?.[row.id] || []).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const current = local.rowOptions?.[row.id] || [];
                          const updated = [...current];
                          updated[idx] = e.target.value;
                          setLocal({
                            ...local,
                            rowOptions: {
                              ...(local.rowOptions || {}),
                              [row.id]: updated,
                            },
                          });
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const current = local.rowOptions?.[row.id] || [];
                          const updated = current.filter((_, i) => i !== idx);
                          const newRowOptions = {
                            ...(local.rowOptions || {}),
                          };
                          if (updated.length > 0) {
                            newRowOptions[row.id] = updated;
                          } else {
                            delete newRowOptions[row.id];
                          }
                          setLocal({ ...local, rowOptions: newRowOptions });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Input
                    placeholder="Ajouter une option"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.currentTarget.value.trim();
                        if (val) {
                          const current = local.rowOptions?.[row.id] || [];
                          setLocal({
                            ...local,
                            rowOptions: {
                              ...(local.rowOptions || {}),
                              [row.id]: [...current, val],
                            },
                          });
                        }
                        e.currentTarget.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        const current = local.rowOptions?.[row.id] || [];
                        setLocal({
                          ...local,
                          rowOptions: {
                            ...(local.rowOptions || {}),
                            [row.id]: [...current, val],
                          },
                        });
                      }
                      e.currentTarget.value = '';
                    }}
                  />
                </div>
              ))}
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
