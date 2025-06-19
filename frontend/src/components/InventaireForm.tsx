import { InputField } from './ui/input-field';
import type { NewInventaire } from '@monorepo/shared';

interface Props {
  data: Partial<NewInventaire>;
  onChange: (data: Partial<NewInventaire>) => void;
}

export default function InventaireForm({ data, onChange }: Props) {
  const update = (field: keyof NewInventaire, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-2">
      <InputField
        label="Pièce"
        value={(data.piece as string) || ''}
        onChange={(v) => update('piece', v)}
        required
      />
      <InputField
        label="Mobilier"
        value={(data.mobilier as string) || ''}
        onChange={(v) => update('mobilier', v)}
        required
      />
      <InputField
        label="Quantité"
        type="number"
        value={data.quantite?.toString() || ''}
        onChange={(v) => update('quantite', Number(v))}
      />
      <InputField
        label="Marque"
        value={(data.marque as string) || ''}
        onChange={(v) => update('marque', v)}
      />
      <InputField
        label="État à l'entrée"
        value={(data.etatEntree as string) || ''}
        onChange={(v) => update('etatEntree', v)}
      />
    </div>
  );
}
