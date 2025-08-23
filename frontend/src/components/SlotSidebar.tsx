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
import { ChevronRight, Plus, Trash2, Settings, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Props {
  slots: SlotSpec[];
  onChange: (slots: SlotSpec[]) => void;
  onAddSlot?: (slot: FieldSpec) => void;
  onUpdateSlot?: (slotId: string, slotLabel: string) => void;
  onTransformToQuestions?: () => void;
  isTransforming?: boolean;
}

export default function SlotSidebar({
  slots,
  onChange,
  onAddSlot,
  onUpdateSlot,
  onTransformToQuestions,
  isTransforming = false,
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
    <aside className="w-120 border-l border-gray-200 bg-gray-50/30 h-screen">
      {/* Header avec boutons d'action */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            {/* Bouton primary pour + Champ */}
            <Button
              size="sm"
              variant="primary"
              onClick={addField}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Champ
            </Button>
            
            {/* Meatball menu pour + Groupe et + Répéteur */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem
                  onClick={addGroup}
                  className="flex items-center gap-2 cursor-pointer hover:bg-green-50"
                >
                  <Plus className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">Groupe</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={addRepeat}
                  className="flex items-center gap-2 cursor-pointer hover:bg-purple-50"
                >
                  <Plus className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-700">Répéteur</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Bouton Transformer en Questions à droite */}
          {onTransformToQuestions && (
            <Button
              size="sm"
              variant="outline"
              onClick={onTransformToQuestions}
              className="ml-auto border-gray-300 hover:bg-gray-50"
              disabled={isTransforming}
            >
              {isTransforming ? 'Transforming...' : 'Transformer en Questions'}
            </Button>
          )}
        </div>
      </div>

      {selectedIndex == null ? (
        <div className="p-4">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="pb-3 px-0">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-gray-900">Slots</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {slots?.length || 0}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 px-0">
              {(slots || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm">Aucun slot créé</p>
                  <p className="text-xs text-gray-400">
                    Commencez par ajouter un champ, groupe ou répéteur
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(slots || []).map((slot, idx) => {
                    const label = (slot as any).label ?? (slot as any).id;
                    const preset =
                      slot.kind === 'field' ? slot.preset : undefined;
                    const slotType =
                      slot.kind === 'field'
                        ? 'Champ'
                        : slot.kind === 'group'
                          ? 'Groupe'
                          : 'Répéteur';

                    return (
                      <div
                        key={(slot as any).id || `${(slot as any).kind}-${idx}`}
                        className="group bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Type et preset */}
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                slot.kind === 'field'
                                  ? 'bg-blue-100 text-blue-700'
                                  : slot.kind === 'group'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {}
                            </span>
                          </div>

                          {/* Input du label */}
                          <div className="flex-1 min-w-0">
                            <Input
                              value={label}
                              onChange={(e) => editLabel(idx, e.target.value)}
                              className="h-8 text-sm border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                              placeholder="Nom du slot..."
                            />
                          </div>
                          {preset && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                              {preset}
                            </span>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => insertSlot(slot)}
                              className="h-7 px-2 text-xs hover:bg-green-50 hover:border-green-200"
                            >
                              Insérer
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeSlot((slot as any).id)}
                              className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              aria-label="Détails"
                              onClick={() => setSelectedIndex(idx)}
                              className="h-7 w-7 p-0 hover:bg-gray-100"
                            >
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIndex(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Retour aux slots
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
