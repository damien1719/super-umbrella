import type {
  SlotSpec,
  FieldSpec,
  GroupSpec,
  RepeatSpec,
} from '../types/template';
import { FIELD_PRESETS } from '../types/template';
import SlotEditor from './SlotEditor';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { Input } from './ui/input';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Props {
  slots: SlotSpec[];
  onChange: (slots: SlotSpec[]) => void;
  onAddSlot?: (slot: FieldSpec) => void;
  onUpdateSlot?: (slotId: string, slotLabel: string) => void;
}

export default function SlotSidebar({
  slots,
  onChange,
  onAddSlot,
  onUpdateSlot,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const updateSlot = (index: number, updated: SlotSpec) => {
    const next = [...(slots || [])];
    next[index] = updated;
    onChange(next);
  };

  const addField = () => {
    const slot: FieldSpec = {
      kind: 'field',
      id: `field-${Date.now()}`,
      type: 'text',
      mode: 'llm',
      label: 'Nouveau champ',
      prompt: FIELD_PRESETS.description.prompt,
      pattern: '',
      deps: [],
      preset: 'description',
    };
    onChange([...(slots || []), slot]);
    onAddSlot?.(slot);
  };

  const addGroup = () => {
    const groupId = `group-${Date.now()}`;
    const firstField: FieldSpec = {
      kind: 'field',
      id: `${groupId}.field-1`,
      type: 'text',
      mode: 'llm',
      label: 'Champ',
      prompt: FIELD_PRESETS.description.prompt,
      pattern: '',
      deps: [],
      preset: 'description',
    };
    const group: GroupSpec = {
      kind: 'group',
      id: groupId,
      label: 'Nouveau groupe',
      slots: [firstField],
    };
    onChange([...(slots || []), group]);
    onAddSlot?.(firstField);
  };

  const addRepeat = () => {
    const repId = `repeat-${Date.now()}`;
    const rep: RepeatSpec = {
      kind: 'repeat',
      id: repId,
      from: { enum: [{ key: 'key_1', label: 'value_1' }] },
      ctx: 'item',
      namePattern: '',
      slots: [
        {
          kind: 'field',
          id: `field-${Date.now()}`,
          type: 'text',
          mode: 'llm',
          label: 'Champ_1',
          prompt: FIELD_PRESETS.description.prompt,
          preset: 'description',
        },
      ],
    };
    onChange([...(slots || []), rep]);
    // Insert expanded fields for existing items
    const ctxName = rep.ctx || 'item';
    if ('enum' in rep.from && rep.slots.length > 0) {
      for (const it of rep.from.enum) {
        for (const child of rep.slots) {
          if (child.kind === 'field' && 'id' in child) {
            const stableId = `${repId}.${it.key}.${child.id}`; // id interne stable
            const fieldIndex = rep.slots.indexOf(child) + 1;
            const cleanLabel = it.label
              .replace(/^value_?/, '')
              .replace(/_/g, '');
            const displayLabel = `${cleanLabel}_slot${fieldIndex}`; // pour l'UI
            onAddSlot?.({ ...child, id: stableId, label: displayLabel });
          }
        }
      }
    }
  };

  const removeSlot = (id: string) => {
    onChange((slots || []).filter((s) => (s as any).id !== id));
    if (selectedIndex != null && (slots[selectedIndex] as any).id === id) {
      setSelectedIndex(null);
    }
  };

  const insertSlot = (slot: SlotSpec) => {
    if (slot.kind === 'field') {
      onAddSlot?.(slot);
      return;
    }
    if (slot.kind === 'group') {
      slot.slots.forEach((child) => {
        if (child.kind === 'field') onAddSlot?.(child);
      });
      return;
    }
    if (slot.kind === 'repeat') {
      const repId = slot.id;
      if ('enum' in slot.from && slot.slots.length > 0) {
        for (const it of slot.from.enum) {
          for (const child of slot.slots) {
            if (child.kind === 'field') {
              const stableId = `${repId}.${it.key}.${child.id}`;
              const fieldIndex = slot.slots.indexOf(child) + 1;
              const cleanLabel = it.label
                .replace(/^value_?/, '')
                .replace(/_/g, '');
              const displayLabel = `${cleanLabel}_slot${fieldIndex}`;
              onAddSlot?.({ ...child, id: stableId, label: displayLabel });
            }
          }
        }
      }
    }
  };

  const editLabel = (index: number, newLabel: string) => {
    const slot = slots[index] as any;
    updateSlot(index, { ...slot, label: newLabel });
    onUpdateSlot?.(slot.id, newLabel);
  };

  return (
    <aside className="w-120 border-l h-screen">
      <div className="flex gap-1 flex-wrap sticky top-0 bg-white">
        <Button size="sm" variant="outline" onClick={addField}>
          + Champ
        </Button>
        <Button size="sm" variant="outline" onClick={addGroup}>
          + Groupe
        </Button>
        <Button size="sm" variant="outline" onClick={addRepeat}>
          + Répéteur
        </Button>
      </div>
      {selectedIndex == null ? (
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">Slots</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            <div className="space-y-1">
              {(slots || []).map((slot, idx) => {
                const label = (slot as any).label ?? (slot as any).id;
                const preset = slot.kind === 'field' ? slot.preset : undefined;
                return (
                  <div
                    key={(slot as any).id || `${(slot as any).kind}-${idx}`}
                    className="flex justify-between items-center gap-2 border rounded p-2"
                  >
                    <div className="flex flex-col flex-1">
                      <Input
                        value={label}
                        onChange={(e) => editLabel(idx, e.target.value)}
                        className="h-7 text-sm"
                      />
                      {preset && (
                        <span className="text-xs text-muted-foreground">
                          {preset}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 items-center">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => insertSlot(slot)}
                      >
                        Insérer
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => removeSlot((slot as any).id)}
                      >
                        ×
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        aria-label="Détails"
                        onClick={() => setSelectedIndex(idx)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIndex(null)}
          >
            Retour
          </Button>
          <SlotEditor
            slot={slots[selectedIndex]}
            onChange={(updated) => updateSlot(selectedIndex, updated)}
            onRemove={() => removeSlot((slots[selectedIndex] as any).id)}
            onAddSlot={onAddSlot}
            onUpdateSlot={onUpdateSlot}
          />
        </div>
      )}
    </aside>
  );
}
