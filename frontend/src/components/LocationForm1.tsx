import { InputField } from './ui/input-field';
import type { NewLocation } from '@monorepo/shared';

interface Props {
  data: Partial<NewLocation>;
  onChange: (data: Partial<NewLocation>) => void;
}

export default function LocationForm1({ data, onChange }: Props) {
  const update = (field: keyof NewLocation, value: string) => {
    let parsed: string | number = value;
    if (field === 'baseRent' || field === 'depositAmount') {
      parsed = value === '' ? undefined : Number(value);
    }
    onChange({ ...data, [field]: parsed } as Partial<NewLocation>);
  };

  return (
    <div className="space-y-2">
      <InputField
        label="Loyer hors charges"
        value={data.baseRent?.toString() ?? ''}
        onChange={(v) => update('baseRent', v)}
        type="number"
        required
      />
      <InputField
        label="Montant du dépôt de garantie"
        value={data.depositAmount?.toString() ?? ''}
        onChange={(v) => update('depositAmount', v)}
        type="number"
      />
      <InputField
        label="Type de dépôt"
        value={(data.depositType as string) ?? ''}
        onChange={(v) => update('depositType', v)}
      />
    </div>
  );
}
