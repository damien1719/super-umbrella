import { InputField } from './ui/input-field';
import type { NewInventaire } from '@monorepo/shared';

const MOBILIER_OPTIONS = [
  'BOUILLOIRE',
  'PORTE_SERVIETTES',
  'POUBELLE_SDB',
  'POUBELLE_WC',
  'ETENDOIR_A_LINGE',
  'SERVIETTES_TOILETTE',
  'ASPIRATEUR',
  'LAVE_LINGE',
  'SECHE_LINGE',
  'PLANCHE_A_REPASSER',
  'CAFETIERE',
  'THEIERE',
  'TELEVISION',
  'LECTEUR_DVD',
  'CHAINE_HIFI',
  'RADIO',
  'FER_A_REPASSER',
  'TABLE_BASSE',
  'TABLE_DE_CHEVET',
  'BUREAU',
  'FAUTEUIL_DE_BUREAU',
  'FAUTEUIL',
  'ARMOIRE',
  'PENDERIE',
  'COMMODE',
  'ETAGERE_DE_RANGEMENT',
  'TAIE_D_OREILLER',
  'VOLET',
  'RIDEAU',
  'STORE_OCCULTANT',
  'STORE',
  'AUTRE_OCCULTATION',
  'LUMINAIRE',
  'ALESE',
  'DRAP_HOUSSE',
  'DRAP',
  'COUETTE',
  'COUVERTURE',
] as const;

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
      <label className="block space-y-1">
        <span className="text-sm font-medium">Mobilier</span>
        <select
          className="border rounded p-2 w-full"
          value={(data.mobilier as string) || ''}
          onChange={(e) => update('mobilier', e.target.value)}
          required
        >
          <option value="">--</option>
          {MOBILIER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
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
