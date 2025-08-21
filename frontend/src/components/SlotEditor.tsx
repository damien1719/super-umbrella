import type { SlotSpec, FieldSpec, GroupSpec, RepeatSpec, SlotType, SlotMode } from '../types/template';

interface Props {
  slot: SlotSpec;
  onChange: (updated: SlotSpec) => void;
  onRemove: () => void;
  onAddSlot?: (slot: FieldSpec) => void;
}

const types: SlotType[] = ['text', 'number', 'list', 'table'];
const modes: SlotMode[] = ['user', 'computed', 'llm'];

export default function SlotEditor({ slot, onChange, onRemove, onAddSlot }: Props) {
  const isGroup = (s: SlotSpec): s is GroupSpec => (s as any).kind === 'group';
  const isRepeat = (s: SlotSpec): s is RepeatSpec => (s as any).kind === 'repeat';
  const isField = (s: SlotSpec): s is FieldSpec => !(s as any).kind;

  const renderField = (field: FieldSpec) => (
    <>
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono">{field.id}</span>
        <button type="button" className="text-xs text-red-600" onClick={onRemove}>
          Supprimer
        </button>
      </div>
      <label className="block text-xs mt-2">Label</label>
      <input
        className="w-full border rounded p-1"
        value={field.label ?? ''}
        onChange={(e) => onChange({ ...field, label: e.target.value })}
      />
      <label className="block text-xs mt-2">Mode</label>
      <select
        className="w-full border rounded p-1"
        value={field.mode || 'user'}
        onChange={(e) => onChange({ ...field, mode: e.target.value as SlotMode })}
      >
        {modes.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <label className="block text-xs mt-2">Type</label>
      <select
        className="w-full border rounded p-1"
        value={field.type}
        onChange={(e) => onChange({ ...field, type: e.target.value as SlotType })}
      >
        {types.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      {field.mode === 'computed' && (
        <>
          <label className="block text-xs mt-2">Pattern</label>
          <input
            className="w-full border rounded p-1"
            value={field.pattern ?? ''}
            onChange={(e) => onChange({ ...field, pattern: e.target.value })}
            placeholder="ex: {firstName} {lastName}"
          />
          <label className="block text-xs mt-2">Dépendances (séparées par des virgules)</label>
          <input
            className="w-full border rounded p-1"
            value={(field.deps ?? []).join(',')}
            onChange={(e) =>
              onChange({
                ...field,
                deps: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="ex: firstName, lastName"
          />
        </>
      )}
      <label className="block text-xs mt-2">Prompt</label>
      <textarea
        className="w-full border rounded p-1"
        value={field.prompt ?? ''}
        onChange={(e) => onChange({ ...field, prompt: e.target.value })}
      />
      <label className="block text-xs mt-2">Template (optionnel)</label>
      <input
        className="w-full border rounded p-1"
        value={field.template ?? ''}
        onChange={(e) => onChange({ ...field, template: e.target.value })}
        placeholder="Mini-moustache pour le rendu"
      />
    </>
  );

  const renderGroup = (group: GroupSpec) => {
    const updateChild = (i: number, updated: SlotSpec) => {
      const next = [...group.slots];
      next[i] = updated;
      onChange({ ...group, slots: next });
    };
    const addFieldInGroup = () => {
      const f: FieldSpec = { id: `${group.id}.field-${Date.now()}`, label: 'Champ', mode: 'llm', type: 'text', deps: [], pattern: '', prompt: '' };
      onChange({ ...group, slots: [...group.slots, f] });
      onAddSlot?.(f);
    };
    const addGroupInGroup = () => {
      const g: GroupSpec = { kind: 'group', id: `${group.id}.group-${Date.now()}`, label: 'Groupe', slots: [] };
      onChange({ ...group, slots: [...group.slots, g] });
    };
    const addRepeatInGroup = () => {
      const r: RepeatSpec = { kind: 'repeat', id: `${group.id}.repeat-${Date.now()}`, from: { enum: [] }, ctx: 'item', namePattern: '', slots: [] };
      onChange({ ...group, slots: [...group.slots, r] });
    };
    const removeGroup = () => onRemove();

    return (
      <>
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono">group: {group.id}</span>
          <button type="button" className="text-xs text-red-600" onClick={removeGroup}>Supprimer</button>
        </div>
        <label className="block text-xs mt-2">Label</label>
        <input className="w-full border rounded p-1" value={group.label ?? ''} onChange={(e) => onChange({ ...group, label: e.target.value })} />
        <div className="flex gap-2 mt-2">
          <button type="button" className="text-xs text-primary-600" onClick={addFieldInGroup}>+ Champ</button>
          <button type="button" className="text-xs text-primary-600" onClick={addGroupInGroup}>+ Groupe</button>
          <button type="button" className="text-xs text-primary-600" onClick={addRepeatInGroup}>+ Répéteur</button>
        </div>
        <div className="mt-2 space-y-2">
          {group.slots.map((child, i) => (
            <SlotEditor key={(child as any).id || `${(child as any).kind}-${i}`} slot={child} onChange={(u) => updateChild(i, u)} onRemove={() => {
              const next = group.slots.filter((_, idx) => idx !== i);
              onChange({ ...group, slots: next });
            }} onAddSlot={onAddSlot} />
          ))}
        </div>
      </>
    );
  };

  const renderRepeat = (rep: RepeatSpec) => {
    const isEnum = (rep.from as any).enum !== undefined;

    const setFromEnum = () => onChange({ ...rep, from: { enum: [] } });
    const setFromPath = () => onChange({ ...rep, from: { path: '' } });

    const addItem = () => {
      if ('enum' in rep.from) {
        const cur = (rep.from as { enum: Array<{ key: string; label: string }> }).enum;
        onChange({ ...rep, from: { enum: [...cur, { key: `key-${Date.now()}`, label: 'Label' }] } });
      }
    };
    const updateItem = (index: number, partial: { key?: string; label?: string }) => {
      if ('enum' in rep.from) {
        const cur = (rep.from as { enum: Array<{ key: string; label: string }> }).enum;
        const next = cur.slice();
        next[index] = { ...next[index], ...partial };
        onChange({ ...rep, from: { enum: next } });
      }
    };
    const removeItem = (index: number) => {
      if ('enum' in rep.from) {
        const cur = (rep.from as { enum: Array<{ key: string; label: string }> }).enum;
        const next = cur.filter((_, i: number) => i !== index);
        onChange({ ...rep, from: { enum: next } });
      }
    };
    const moveItem = (index: number, dir: -1 | 1) => {
      if ('enum' in rep.from) {
        const cur = (rep.from as { enum: Array<{ key: string; label: string }> }).enum;
        const next = cur.slice();
        const j = index + dir;
        if (j < 0 || j >= next.length) return;
        const tmp = next[index];
        next[index] = next[j];
        next[j] = tmp;
        onChange({ ...rep, from: { enum: next } });
      }
    };

    const addFieldInRep = () => {
      const ctxName = rep.ctx || 'item';
      const template: FieldSpec = { id: `${rep.id}.{{item.key}}.field-${Date.now()}`, label: 'Champ', mode: 'llm', type: 'text', deps: [], pattern: '', prompt: '' };
      onChange({ ...rep, slots: [...rep.slots, template] });
      // Insert expanded fields for existing items
      if ('enum' in rep.from) {
        for (const it of (rep.from as { enum: Array<{ key: string; label: string }> }).enum) {
          const baseId = String(template.id).replace(/\{\{\s*item\.key\s*\}\}/g, it.key);
          const finalId = rep.namePattern ? String(rep.namePattern).replace(/\$\{group\}/g, '').replace(/\$\{item\.key\}/g, it.key).replace(/\$\{slotId\}/g, baseId) : baseId;
          onAddSlot?.({ ...template, id: finalId });
        }
      }
    };
    const updateChild = (i: number, updated: SlotSpec) => {
      // In repeat, children are FieldSpec templates; enforce FieldSpec
      onChange({ ...rep, slots: rep.slots.map((s, idx) => (idx === i ? (updated as FieldSpec) : s)) });
    };

    return (
      <>
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono">repeat: {rep.id}</span>
          <button type="button" className="text-xs text-red-600" onClick={onRemove}>Supprimer</button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="block text-xs">Contexte</label>
            <input className="w-full border rounded p-1" value={rep.ctx ?? 'item'} onChange={(e) => onChange({ ...rep, ctx: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs">namePattern</label>
            <input className="w-full border rounded p-1" value={rep.namePattern ?? ''} onChange={(e) => onChange({ ...rep, namePattern: e.target.value })} placeholder="${group}.${item.key}.${slotId}" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex gap-2 text-xs">
            <button type="button" className={`underline ${isEnum ? 'font-bold' : ''}`} onClick={setFromEnum}>Source: liste</button>
            <button type="button" className={`underline ${!isEnum ? 'font-bold' : ''}`} onClick={setFromPath}>Source: chemin</button>
          </div>
          {isEnum ? (
            <div className="mt-2 space-y-2">
              {(rep.from as { enum: Array<{ key: string; label: string }> }).enum.map((it: { key: string; label: string }, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input className="border rounded p-1" value={it.key} onChange={(e) => updateItem(i, { key: e.target.value })} placeholder="key" />
                  <input className="border rounded p-1" value={it.label} onChange={(e) => updateItem(i, { label: e.target.value })} placeholder="label" />
                  <div className="flex gap-1">
                    <button type="button" className="text-xs" onClick={() => moveItem(i, -1)}>⤴</button>
                    <button type="button" className="text-xs" onClick={() => moveItem(i, +1)}>⤵</button>
                    <button type="button" className="text-xs text-red-600" onClick={() => removeItem(i)}>Supprimer</button>
                  </div>
                </div>
              ))}
              <button type="button" className="text-xs text-primary-600" onClick={addItem}>+ Ajouter item</button>
            </div>
          ) : (
            <div className="mt-2">
              <label className="block text-xs">Chemin (ex: notes.mabc.dimensions)</label>
              <input className="w-full border rounded p-1" value={'path' in rep.from ? rep.from.path : ''} onChange={(e) => onChange({ ...rep, from: { path: e.target.value } })} />
            </div>
          )}
        </div>
        <div className="mt-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold">Slots générés par item</span>
            <button type="button" className="text-xs text-primary-600" onClick={addFieldInRep}>+ Champ</button>
          </div>
          <div className="space-y-2 mt-2">
            {rep.slots.map((child, i) => (
              <SlotEditor key={(child as any).id || i} slot={child} onChange={(u) => updateChild(i, u)} onRemove={() => {
                const next = rep.slots.filter((_, idx) => idx !== i);
                onChange({ ...rep, slots: next });
              }} onAddSlot={onAddSlot} />
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="border-b pb-2 last:border-b-0">
      {isField(slot) && renderField(slot)}
      {isGroup(slot) && renderGroup(slot)}
      {isRepeat(slot) && renderRepeat(slot)}
    </div>
  );
}
