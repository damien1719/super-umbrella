import { InputField } from './ui/input-field';
import type { NewLocation } from '@monorepo/shared';

interface Props {
  data: Partial<NewLocation>;
  onChange: (data: Partial<NewLocation>) => void;
}

export default function LocationForm2({ data, onChange }: Props) {
  const update = (field: keyof NewLocation, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <input
          type="checkbox"
          checked={data.travauxByBailleur ?? false}
          onChange={(e) => update('travauxByBailleur', e.target.checked)}
        />{' '}
        Travaux effectués par bailleur
      </label>
      <InputField
        label="Nature des travaux"
        value={data.natureTravaux ?? ''}
        onChange={(v) => update('natureTravaux', v)}
      />
      <InputField
        label="Montant des travaux"
        value={data.montantTravaux?.toString() ?? ''}
        onChange={(v) => update('montantTravaux', v)}
        type="number"
      />
      <label className="block">
        <input
          type="checkbox"
          checked={data.majorationLoyerTravaux ?? false}
          onChange={(e) => update('majorationLoyerTravaux', e.target.checked)}
        />{' '}
        Majoration suite à travaux bailleur
      </label>
      <label className="block">
        <input
          type="checkbox"
          checked={data.travauxByLocataire ?? false}
          onChange={(e) => update('travauxByLocataire', e.target.checked)}
        />{' '}
        Travaux prévus par locataire
      </label>
      <label className="block">
        <input
          type="checkbox"
          checked={data.clauseRenouvellement ?? false}
          onChange={(e) => update('clauseRenouvellement', e.target.checked)}
        />{' '}
        Clause réévaluation renouvellement
      </label>
    </div>
  );
}
