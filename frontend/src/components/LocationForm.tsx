import { useState } from 'react';
import { InputField } from './ui/input-field';
import { Button } from './ui/button';
import { useLocationStore } from '../store/locations';
import type { NewLocation } from '@monorepo/shared';

interface LocationFormProps {
  bienId: string;
  onCancel: () => void;
}

export default function LocationForm({ bienId, onCancel }: LocationFormProps) {
  const createForBien = useLocationStore((s) => s.createForBien);
  const [baseRent, setBaseRent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload: NewLocation = {
        baseRent: Number(baseRent),
        bienId,
      } as NewLocation;
      await createForBien(bienId, payload);
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border p-4 rounded">
      {error && <div className="text-red-600">{error}</div>}
      <InputField
        label="Loyer hors charges"
        value={baseRent}
        onChange={setBaseRent}
        type="number"
        required
      />
      <div className="space-x-2">
        <Button type="submit" variant="primary">
          Valider
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
