import { InputField } from './ui/input-field';
import type { NewLocation } from '@monorepo/shared';

interface Props {
  data: Partial<NewLocation>;
  onChange: (data: Partial<NewLocation>) => void;
}

export default function LocationForm1({ data, onChange }: Props) {
  const update = (field: keyof NewLocation, value: string) => {
    let parsed: string | number | string[] = value;
    if (
      field === 'baseRent' ||
      field === 'depositAmount' ||
      field === 'signatureCopies'
    ) {
      parsed = value === '' ? undefined : Number(value);
    } else if (field === 'typeBail') {
      parsed = [value];
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
        required
      />
      <InputField
        label="Date début du bail"
        value={(data.leaseStartDate as string) ?? ''}
        onChange={(v) => update('leaseStartDate', v)}
        type="date"
        required
      />
      <InputField
        label="Nombre d'exemplaires"
        value={data.signatureCopies?.toString() ?? ''}
        onChange={(v) => update('signatureCopies', v)}
        type="number"
        required
      />
      <label className="block space-y-1">
        <span className="text-sm font-medium">
          Situation locative précédente
        </span>
        <select
          className="border rounded p-2 w-full"
          value={data.previousSituation ?? ''}
          onChange={(e) => update('previousSituation', e.target.value)}
          required
        >
          <option value="">--</option>
          <option value="FIRST_TIME">Première mise en location</option>
          <option value="NO_CONTRACT_LAST_18_MONTH">
            Pas de contrat ces 18 derniers mois
          </option>
          <option value="HAD_CONTRACT_LAST_18_MONTH">
            Contrat ces 18 derniers mois
          </option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Type de bail</span>
        <select
          className="border rounded p-2 w-full"
          value={data.typeBail?.[0] ?? 'MEUBLE'}
          onChange={(e) => update('typeBail', e.target.value)}
        >
          <option value="MEUBLE">Meublé</option>
        </select>
      </label>
    </div>
  );
}
