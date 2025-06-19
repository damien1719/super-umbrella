import { InputField } from './ui/input-field';
import type { NewLocataire } from '@monorepo/shared';

interface Props {
  data: Partial<NewLocataire>;
  onChange: (data: Partial<NewLocataire>) => void;
}

export default function LocataireForm({ data, onChange }: Props) {
  const update = (field: keyof NewLocataire, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-2">
      <InputField
        label="Civilité"
        value={data.civilite ?? ''}
        onChange={(v) => update('civilite', v)}
      />
      <InputField
        label="Prénom"
        value={data.prenom ?? ''}
        onChange={(v) => update('prenom', v)}
      />
      <InputField
        label="Nom"
        value={data.nom ?? ''}
        onChange={(v) => update('nom', v)}
      />
      <InputField
        label="Date de naissance"
        value={(data.dateNaissance as string) ?? ''}
        onChange={(v) => update('dateNaissance', v)}
        type="date"
      />
    </div>
  );
}
