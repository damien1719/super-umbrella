import type { SlotSpec, FieldSpec } from '../types/template';
import SlotEditor from './SlotEditor';
import { Button } from './ui/button';

interface Props {
  slot: SlotSpec;
  onChange: (updated: SlotSpec) => void;
  onRemove: () => void;
  onAddSlot?: (slot: FieldSpec) => void;
  onUpdateSlot?: (slotId: string, slotLabel: string) => void;
  onBack: () => void;
}

export default function SlotDetails({
  slot,
  onChange,
  onRemove,
  onAddSlot,
  onUpdateSlot,
  onBack,
}: Props) {
  return (
    <div className="space-y-2">
      <Button size="sm" variant="ghost" onClick={onBack}>
        Retour
      </Button>
      <SlotEditor
        slot={slot}
        onChange={onChange}
        onRemove={onRemove}
        onAddSlot={onAddSlot}
        onUpdateSlot={onUpdateSlot}
      />
    </div>
  );
}
