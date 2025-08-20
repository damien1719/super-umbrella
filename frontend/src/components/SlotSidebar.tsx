import type { Slot, SlotType } from '../types/template';

interface Props {
  slots: Slot[];
  onChange: (slots: Slot[]) => void;
}

const types: SlotType[] = ['text', 'number', 'choice', 'table'];

export default function SlotSidebar({ slots, onChange }: Props) {
  const updateSlot = (index: number, partial: Partial<Slot>) => {
    const next = [...slots];
    next[index] = { ...next[index], ...partial };
    onChange(next);
  };

  const addSlot = () => {
    onChange([
      ...slots,
      {
        id: Date.now().toString(),
        type: 'text',
        label: '',
        options: [],
        prompt: '',
      },
    ]);
  };

  const removeSlot = (id: string) => {
    onChange(slots.filter((s) => s.id !== id));
  };

  return (
    <aside className="w-64 border-l pl-4 space-y-4">
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
        <div key={slot.id} className="border-b pb-2 last:border-b-0">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono">{slot.id}</span>
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() => removeSlot(slot.id)}
            >
              Supprimer
            </button>
          </div>
          <label className="block text-xs mt-2">Label</label>
          <input
            className="w-full border rounded p-1"
            value={slot.label ?? ''}
            onChange={(e) => updateSlot(idx, { label: e.target.value })}
          />
          <label className="block text-xs mt-2">Type</label>
          <select
            className="w-full border rounded p-1"
            value={slot.type}
            onChange={(e) =>
              updateSlot(idx, { type: e.target.value as SlotType })
            }
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {slot.type === 'choice' && (
            <>
              <label className="block text-xs mt-2">
                Options (séparées par des virgules)
              </label>
              <input
                className="w-full border rounded p-1"
                value={(slot.options ?? []).join(',')}
                onChange={(e) =>
                  updateSlot(idx, {
                    options: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </>
          )}
          <label className="block text-xs mt-2">Prompt</label>
          <textarea
            className="w-full border rounded p-1"
            value={slot.prompt ?? ''}
            onChange={(e) => updateSlot(idx, { prompt: e.target.value })}
          />
        </div>
      ))}
    </aside>
  );
}
