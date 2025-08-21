import type { Slot } from '../types/template';
import SlotEditor from './SlotEditor';

interface Props {
  slots: Slot[];
  onChange: (slots: Slot[]) => void;
  onAddSlot?: (slot: Slot) => void;
}

export default function SlotSidebar({ slots, onChange, onAddSlot }: Props) {
  const updateSlot = (index: number, partial: Partial<Slot>) => {
    const next = [...slots];
    next[index] = { ...next[index], ...partial };
    onChange(next);
  };

  const addSlot = () => {
    const slot: Slot = {
      id: Date.now().toString(),
      type: 'text',
      mode: 'llm',
      label: 'Nouveau slot ' + (slots.length + 1),
      options: [],
      prompt: '',
      pattern: '',
      deps: [],
    };
    onChange([...slots, slot]);
    onAddSlot?.(slot);
  };

  const removeSlot = (id: string) => {
    onChange(slots.filter((s) => s.id !== id));
  };

  return (
    <aside className="w-120 border-l pl-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Slots</h3>
        <button
          type="button"
          className="text-sm text-primary-600"
          onClick={addSlot}
        >
          Ajouter
        </button>
      </div>
      {slots.map((slot, idx) => (
        <SlotEditor
          key={slot.id}
          slot={slot}
          onChange={(partial) => updateSlot(idx, partial)}
         onRemove={() => removeSlot(slot.id)}
        />
      ))}
    </aside>
  );
}
