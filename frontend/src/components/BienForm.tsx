import { useState } from 'react';
import { InputField } from './ui/input-field';
import { Button } from './ui/button';
import { useBienStore, Bien } from '../store/biens';

interface BienFormProps {
  bien?: Bien | null;
  onCancel: () => void;
}

export default function BienForm({ bien, onCancel }: BienFormProps) {
  const isEdit = Boolean(bien);
  const [typeBien, setTypeBien] = useState(bien?.typeBien ?? '');
  const [adresse, setAdresse] = useState(bien?.adresse ?? '');
  const { create, update } = useBienStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && bien) {
      await update(bien.id, { typeBien, adresse });
    } else {
      await create({ typeBien, adresse });
    }
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border p-4 rounded">
      <InputField
        label="Type de bien"
        value={typeBien}
        onChange={setTypeBien}
        required
      />
      <InputField
        label="Adresse"
        value={adresse}
        onChange={setAdresse}
        required
      />
      <div className="space-x-2">
        <Button variant="primary" type="submit">
          Valider
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
