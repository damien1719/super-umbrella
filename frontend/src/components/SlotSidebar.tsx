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
  // Debug logs
  console.log('[DEBUG] SlotSidebar - Props received:', {
    slotsCount: slots?.length || 0,
    slotsType: typeof slots,
    isArray: Array.isArray(slots),
    slotsContent: JSON.stringify(slots, null, 2),
  });

  if (slots && slots.length > 0) {
    console.log('[DEBUG] SlotSidebar - First few slots structure:');
    slots.slice(0, 3).forEach((slot, idx) => {
      console.log(`[DEBUG] SlotSidebar - Slot ${idx}:`, {
        kind: (slot as any).kind,
        id: (slot as any).id,
        label: (slot as any).label,
        type: (slot as any).type,
        fullSlot: slot,
      });
    });
  }

  const simpleTpl = (input: string, ctx: Record<string, unknown>) =>
    String(input || '').replace(/\{\{\s*([\w\.]+)\s*\}\}/g, (_, key) => {
      const parts = String(key).split('.');
      let cur: any = ctx;
      for (const p of parts) cur = cur?.[p];
      return cur == null ? '' : String(cur);
    });

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
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Slots</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-2">
          <div className="space-y-1">
            {(slots || []).map((slot, idx) => (
              <SlotEditor
                key={(slot as any).id || `${(slot as any).kind}-${idx}`}
                slot={slot}
                onChange={(updated) => updateSlot(idx, updated)}
                onRemove={() => removeSlot((slot as any).id)}
                onAddSlot={onAddSlot}
                onUpdateSlot={onUpdateSlot}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
