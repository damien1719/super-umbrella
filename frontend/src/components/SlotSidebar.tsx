import type { SlotSpec, FieldSpec, GroupSpec, RepeatSpec } from '../types/template';
import SlotEditor from './SlotEditor';

interface Props {
  slots: SlotSpec[];
  onChange: (slots: SlotSpec[]) => void;
  onAddSlot?: (slot: FieldSpec) => void;
}

export default function SlotSidebar({ slots, onChange, onAddSlot }: Props) {
  const simpleTpl = (input: string, ctx: Record<string, unknown>) =>
    String(input || '').replace(/\{\{\s*([\w\.]+)\s*\}\}/g, (_, key) => {
      const parts = String(key).split('.');
      let cur: any = ctx;
      for (const p of parts) cur = cur?.[p];
      return cur == null ? '' : String(cur);
    });

  const updateSlot = (index: number, updated: SlotSpec) => {
    const next = [...slots];
    next[index] = updated;
    onChange(next);
  };

  const addField = () => {
    const slot: FieldSpec = {
      id: `field-${Date.now()}`,
      type: 'text',
      mode: 'llm',
      label: 'Nouveau champ',
      prompt: '',
      pattern: '',
      deps: [],
    };
    onChange([...(slots || []), slot]);
    onAddSlot?.(slot);
  };

  const addGroup = () => {
    const groupId = `group-${Date.now()}`;
    const firstField: FieldSpec = {
      id: `${groupId}.field-1`,
      type: 'text',
      mode: 'llm',
      label: 'Champ',
      prompt: '',
      pattern: '',
      deps: [],
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
      from: { enum: [{ key: 'item1', label: 'Item 1' }] },
      ctx: 'item',
      namePattern: '',
      slots: [
        {
          id: `${repId}.{{item.key}}.field-1`,
          type: 'text',
          mode: 'llm',
          label: 'Nouveau champ',
        },
      ],
    };
    onChange([...(slots || []), rep]);
    // Insert expanded fields for existing items
    const ctxName = rep.ctx || 'item';
    if ('enum' in rep.from && rep.slots.length > 0) {
      for (const it of rep.from.enum) {
        for (const child of rep.slots) {
          const baseId = simpleTpl(child.id, { [ctxName]: it, item: it });
          const finalId = rep.namePattern
            ? simpleTpl(rep.namePattern, { group: '', item: it, slotId: baseId })
            : baseId;
          onAddSlot?.({ ...child, id: finalId });
        }
      }
    }
  };

  const removeSlot = (id: string) => {
    onChange(slots.filter((s) => (s as any).id !== id));
  };

  return (
    <aside className="w-120 border-l pl-4 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Slots</h3>
        </div>
        <div className="flex gap-2">
          <button type="button" className="text-sm text-primary-600" onClick={addField}>
            + Ajouter un champ
          </button>
          <button type="button" className="text-sm text-primary-600" onClick={addGroup}>
            + Ajouter un groupe
          </button>
          <button type="button" className="text-sm text-primary-600" onClick={addRepeat}>
            + Ajouter un répéteur
          </button>
        </div>
      </div>
      {slots.map((slot, idx) => (
        <SlotEditor
          key={(slot as any).id || `${(slot as any).kind}-${idx}`}
          slot={slot}
          onChange={(updated) => updateSlot(idx, updated)}
         onRemove={() => removeSlot((slot as any).id)}
         onAddSlot={onAddSlot}
        />
      ))}
    </aside>
  );
}
