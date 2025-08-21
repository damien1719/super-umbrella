import type { SlotSpec, FieldSpec, GroupSpec, RepeatSpec, SlotType, SlotMode } from '../types/template';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Props {
  slot: SlotSpec;
  onChange: (updated: SlotSpec) => void;
  onRemove: () => void;
  onAddSlot?: (slot: FieldSpec) => void;
  onUpdateSlot?: (slotId: string, slotLabel: string) => void;
}

const types: SlotType[] = ['text', 'number', 'list', 'table'];
const modes: SlotMode[] = ['user', 'computed', 'llm'];

export default function SlotEditor({ slot, onChange, onRemove, onAddSlot, onUpdateSlot }: Props) {
  const isGroup = (s: SlotSpec): s is GroupSpec => (s as any).kind === 'group';
  const isRepeat = (s: SlotSpec): s is RepeatSpec => (s as any).kind === 'repeat';
  const isField = (s: SlotSpec): s is FieldSpec => !(s as any).kind;

  const renderField = (field: FieldSpec) => (
    <Card className="mb-2">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Champ</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onAddSlot?.(field)}>
              Insérer
            </Button>
            <Button size="sm" variant="destructive" onClick={onRemove}>
              Supprimer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`label-${field.id}`} className="text-xs">Label</Label>
          <Input
            id={`label-${field.id}`}
            value={field.label ?? ''}
            onChange={(e) => onChange({ ...field, label: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`mode-${field.id}`} className="text-xs">Mode</Label>
          <Select value={field.mode || 'user'} onValueChange={(value) => onChange({ ...field, mode: value as SlotMode })}>
            <SelectTrigger id={`mode-${field.id}`} className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modes.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`type-${field.id}`} className="text-xs">Type</Label>
          <Select value={field.type} onValueChange={(value) => onChange({ ...field, type: value as SlotType })}>
            <SelectTrigger id={`type-${field.id}`} className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {field.mode === 'computed' && (
          <>
            <div>
              <Label htmlFor={`pattern-${field.id}`} className="text-xs">Pattern</Label>
              <Input
                id={`pattern-${field.id}`}
                value={field.pattern ?? ''}
                onChange={(e) => onChange({ ...field, pattern: e.target.value })}
                placeholder="ex: {firstName} {lastName}"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`deps-${field.id}`} className="text-xs">Dépendances (séparées par des virgules)</Label>
              <Input
                id={`deps-${field.id}`}
                value={(field.deps ?? []).join(',')}
                onChange={(e) =>
                  onChange({
                    ...field,
                    deps: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="ex: firstName, lastName"
                className="mt-1"
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor={`prompt-${field.id}`} className="text-xs">Prompt</Label>
          <Textarea
            id={`prompt-${field.id}`}
            value={field.prompt ?? ''}
            onChange={(e) => onChange({ ...field, prompt: e.target.value })}
            className="mt-1 min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor={`template-${field.id}`} className="text-xs">Template (optionnel)</Label>
          <Input
            id={`template-${field.id}`}
            value={field.template ?? ''}
            onChange={(e) => onChange({ ...field, template: e.target.value })}
            placeholder="Mini-moustache pour le rendu"
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderGroup = (group: GroupSpec) => {
    const updateChild = (i: number, updated: SlotSpec) => {
      const next = [...group.slots];
      next[i] = updated;
      onChange({ ...group, slots: next });
    };
    const addFieldInGroup = () => {
      const f: FieldSpec = { id: `${group.id}.field-${Date.now()}`, label: 'slot', mode: 'llm', type: 'text', deps: [], pattern: '', prompt: '' };
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
      <Card className="mb-2">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Groupe</span>
            <Button size="sm" variant="destructive" onClick={removeGroup}>
              Supprimer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`group-label-${group.id}`} className="text-xs">Label</Label>
            <Input
              id={`group-label-${group.id}`}
              value={group.label ?? ''}
              onChange={(e) => onChange({ ...group, label: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={addFieldInGroup}>
              + slot
            </Button>
            <Button size="sm" variant="outline" onClick={addGroupInGroup}>
              + Groupe
            </Button>
            <Button size="sm" variant="outline" onClick={addRepeatInGroup}>
              + Répéteur
            </Button>
          </div>
          <div className="space-y-2">
            {group.slots.map((child, i) => (
              <SlotEditor key={(child as any).id || `${(child as any).kind}-${i}`} slot={child} onChange={(u) => updateChild(i, u)} onRemove={() => {
                const next = group.slots.filter((_, idx) => idx !== i);
                onChange({ ...group, slots: next });
              }} onAddSlot={onAddSlot} onUpdateSlot={onUpdateSlot} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRepeat = (rep: RepeatSpec) => {
    // Ensure we always have an enum list
    const currentRep = 'enum' in rep.from ? rep : { ...rep, from: { enum: [{ key: 'item1', label: 'Item 1' }] } };

    const addItem = () => {
      const cur = (currentRep.from as { enum: Array<{ key: string; label: string }> }).enum;
      const nextIndex = cur.length + 1;
      onChange({ ...currentRep, from: { enum: [...cur, { key: `key_${nextIndex}`, label: `value_${nextIndex}` }] } });
    };

    const updateItem = (index: number, partial: { key?: string; label?: string }) => {
      const cur = (currentRep.from as { enum: Array<{ key: string; label: string }> }).enum;
      const oldItem = cur[index];
      const newItem = { ...oldItem, ...partial };
      const next = cur.slice();
      next[index] = newItem;
      const updatedRep = { ...currentRep, from: { enum: next } };

      // Si le label a changé, mettre à jour tous les slots concrets correspondants
      if (partial.label && oldItem.label !== newItem.label) {
        currentRep.slots.forEach((child, childIndex) => {
          const stableId = `${currentRep.id}.${newItem.key}.${child.id}`;
          const cleanLabel = newItem.label.replace(/^value_?/, '').replace(/_/g, '');
          const fieldIndex = childIndex + 1;
          const displayLabel = `${cleanLabel}_${child.label || 'slot' + fieldIndex}`;

          // Update the concrete slot with new label
          onUpdateSlot?.(stableId, displayLabel);
        });
      }

      onChange(updatedRep);
    };

    const removeItem = (index: number) => {
      const cur = (currentRep.from as { enum: Array<{ key: string; label: string }> }).enum;
      const next = cur.filter((_, i: number) => i !== index);
      onChange({ ...currentRep, from: { enum: next } });
    };
    const moveItem = (index: number, dir: -1 | 1) => {
      const cur = (currentRep.from as { enum: Array<{ key: string; label: string }> }).enum;
      const next = cur.slice();
      const j = index + dir;
      if (j < 0 || j >= next.length) return;
      const tmp = next[index];
      next[index] = next[j];
      next[j] = tmp;
      onChange({ ...currentRep, from: { enum: next } });
    };

    const addFieldInRep = () => {
      const ctxName = currentRep.ctx || 'item';
      const nextFieldIndex = currentRep.slots.length + 1;
      const template: FieldSpec = {
        id: `${currentRep.id}.{{item.key}}.slot_${nextFieldIndex}`,
        label: `slot_${nextFieldIndex}`,
        mode: 'llm',
        type: 'text',
        deps: [],
        pattern: '',
        prompt: ''
      };
      onChange({ ...currentRep, slots: [...currentRep.slots, template] });
      // Insert expanded fields for existing items
      const enumItems = (currentRep.from as { enum: Array<{ key: string; label: string }> }).enum;
      for (const it of enumItems) {
        const stableId = `${currentRep.id}.${it.key}.${template.id}`;   // id interne stable
        const cleanLabel = it.label.replace(/^value_?/, '').replace(/_/g, '');
        const displayLabel = `${cleanLabel}_slot${nextFieldIndex}`; // pour l'UI



        onAddSlot?.({ ...template, id: stableId, label: displayLabel });
      }
    };
    const updateChild = (i: number, updated: SlotSpec) => {
      // In repeat, children are FieldSpec templates; enforce FieldSpec
      const updatedRep = {
        ...currentRep,
        slots: currentRep.slots.map((s, idx) => (idx === i ? (updated as FieldSpec) : s))
      };

      // Propager les changements de label aux slots concrets existants
      const oldChild = currentRep.slots[i];
      const newChild = updated as FieldSpec;

      console.log('[DEBUG] updateChild - Checking label change:', {
        oldLabel: oldChild.label,
        newLabel: newChild.label,
        hasChanged: oldChild.label !== newChild.label,
        repId: currentRep.id,
        childId: newChild.id
      });

      // Only propagate if the label has changed
      if (oldChild.label !== newChild.label) {
        console.log('[DEBUG] updateChild - Label changed, propagating to concrete slots');

        // Update all concrete slots created from this template
        const enumItems = (currentRep.from as { enum: Array<{ key: string; label: string }> }).enum;
        enumItems.forEach((it, itemIndex) => {
          const stableId = `${currentRep.id}.${it.key}.${newChild.id}`;
          const cleanLabel = it.label.replace(/^value_?/, '').replace(/_/g, '');
          const fieldIndex = i + 1;
          const displayLabel = `${cleanLabel}_${newChild.label || 'slot' + fieldIndex}`;

          console.log('[DEBUG] updateChild - Updating concrete slot:', {
            item: it,
            stableId,
            displayLabel,
            willCallOnUpdateSlot: !!onUpdateSlot
          });

          // Update the concrete slot with new label
          onUpdateSlot?.(stableId, displayLabel);
        });
      } else {
        console.log('[DEBUG] updateChild - Label did not change, no propagation needed');
      }

      onChange(updatedRep);
    };

    return (
      <Card className="mb-2">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Répéteur</span>
            <Button size="sm" variant="destructive" onClick={onRemove}>
              Supprimer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">

          <div>
            <Label className="text-xs font-semibold">Items à répéter</Label>
            <div className="mt-2 space-y-2">
              {(currentRep.from as { enum: Array<{ key: string; label: string }> }).enum.map((it: { key: string; label: string }, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded gap-2">
                  <div className="flex-1">
                    <Input
                      value={it.label}
                      onChange={(e) => updateItem(i, { label: e.target.value })}
                      placeholder="Label de l'item"
                      className="text-xs"
                    />
                  </div>
                  <div className="flex gap-1">
{/*                     <Button size="sm" variant="ghost" onClick={() => moveItem(i, -1)}>⤴</Button>
                    <Button size="sm" variant="ghost" onClick={() => moveItem(i, +1)}>⤵</Button>
 */}                    <Button size="sm" variant="outline" onClick={() => {
                      // Insert all fields for this specific item
                      const ctxName = currentRep.ctx || 'item';

                      for (const child of currentRep.slots) {
                        const stableId = `${currentRep.id}.${it.key}.${child.id}`;   // id interne stable
                        const fieldIndex = currentRep.slots.indexOf(child) + 1;
                        const cleanLabel = it.label.replace(/^value_?/, '').replace(/_/g, '');
                        const displayLabel = `${cleanLabel}_slot${fieldIndex}`; // pour l'UI



                        onAddSlot?.({ ...child, id: stableId, label: displayLabel });
                      }
                    }}>Insérer</Button>
                    <Button size="sm" variant="destructive" onClick={() => removeItem(i)}>×</Button>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addItem}>+ Ajouter item</Button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold">Champs par item</Label>
              <Button size="sm" variant="outline" onClick={addFieldInRep}>+ champ</Button>
            </div>
            <div className="space-y-2 mt-2">
              {currentRep.slots.map((child, i) => (
                              <SlotEditor key={(child as any).id || i} slot={child} onChange={(u) => updateChild(i, u)} onRemove={() => {
                const next = currentRep.slots.filter((_, idx) => idx !== i);
                onChange({ ...currentRep, slots: next });
              }} onAddSlot={onAddSlot} onUpdateSlot={onUpdateSlot} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
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
