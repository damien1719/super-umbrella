import type { Slot, SlotType, SlotMode } from '../types/template';

interface Props {
  slot: Slot;
  onChange: (partial: Partial<Slot>) => void;
  onRemove: () => void;
}

const types: SlotType[] = ['text', 'number', 'choice', 'table'];
const modes: SlotMode[] = ['user', 'computed', 'llm'];

export default function SlotEditor({ slot, onChange, onRemove }: Props) {
  return (
    <div className="border-b pb-2 last:border-b-0">
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono">{slot.id}</span>
        <button
          type="button"
          className="text-xs text-red-600"
          onClick={onRemove}
        >
          Supprimer
        </button>
      </div>
      <label className="block text-xs mt-2">Label</label>
      <input
        className="w-full border rounded p-1"
        value={slot.label ?? ''}
        onChange={(e) => onChange({ label: e.target.value })}
      />
      <label className="block text-xs mt-2">Mode</label>
      <select
        className="w-full border rounded p-1"
        value={slot.mode || 'user'}
        onChange={(e) => onChange({ mode: e.target.value as SlotMode })}
      >
        {modes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <label className="block text-xs mt-2">Type</label>
      <select
        className="w-full border rounded p-1"
        value={slot.type}
        onChange={(e) => onChange({ type: e.target.value as SlotType })}
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
              onChange({
                options: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </>
      )}
      {slot.mode === 'computed' && (
        <>
          <label className="block text-xs mt-2">Pattern</label>
          <input
            className="w-full border rounded p-1"
            value={slot.pattern ?? ''}
            onChange={(e) => onChange({ pattern: e.target.value })}
            placeholder="ex: {firstName} {lastName}"
          />
          <label className="block text-xs mt-2">
            Dependencies (séparées par des virgules)
          </label>
          <input
            className="w-full border rounded p-1"
            value={(slot.deps ?? []).join(',')}
            onChange={(e) =>
              onChange({
                deps: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="ex: firstName, lastName"
          />
        </>
      )}
      <label className="block text-xs mt-2">Prompt</label>
      <textarea
        className="w-full border rounded p-1"
        value={slot.prompt ?? ''}
        onChange={(e) => onChange({ prompt: e.target.value })}
      />
    </div>
  );
}
