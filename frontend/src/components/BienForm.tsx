import { useState } from 'react';
import { InputField } from './ui/input-field';
import { Button } from './ui/button';
import { useBienStore, Bien, BienInput } from '../store/biens';

interface BienFormProps {
  bien?: Bien | null;
  onCancel: () => void;
}

export default function BienForm({ bien, onCancel }: BienFormProps) {
  const isEdit = Boolean(bien);
  const [typeBien, setTypeBien] = useState(bien?.typeBien ?? '');
  const [adresse, setAdresse] = useState(bien?.adresse ?? '');
  const [codePostal, setCodePostal] = useState(bien?.codePostal ?? '');
  const [ville, setVille] = useState(bien?.ville ?? '');
  const [pays, setPays] = useState(bien?.pays ?? '');
  const [numeroIdentifiantFiscal, setNumeroIdentifiantFiscal] = useState(
    bien?.numeroIdentifiantFiscal ?? '',
  );
  const [dpe, setDpe] = useState(bien?.dpe ?? '');
  const [regimeJuridique, setRegimeJuridique] = useState(
    bien?.regimeJuridique ?? '',
  );
  const [surfaceHabitable, setSurfaceHabitable] = useState(
    bien?.surfaceHabitable?.toString() ?? '',
  );
  const [nombrePieces, setNombrePieces] = useState(
    bien?.nombrePieces?.toString() ?? '',
  );
  const [anneeConstruction, setAnneeConstruction] = useState(
    bien?.anneeConstruction?.toString() ?? '',
  );
  const [cuisine, setCuisine] = useState(bien?.cuisine ?? '');
  const [nombreChambres, setNombreChambres] = useState(
    bien?.nombreChambres?.toString() ?? '',
  );
  const [nombreSejours, setNombreSejours] = useState(
    bien?.nombreSejours?.toString() ?? '',
  );
  const [nombreSallesDEau, setNombreSallesDEau] = useState(
    bien?.nombreSallesDEau?.toString() ?? '',
  );
  const [nombreSallesDeBains, setNombreSallesDeBains] = useState(
    bien?.nombreSallesDeBains?.toString() ?? '',
  );
  const [nombreWC, setNombreWC] = useState(bien?.nombreWC?.toString() ?? '');
  const [typeChauffage, setTypeChauffage] = useState(bien?.typeChauffage ?? '');
  const [autresTypesChauffage, setAutresTypesChauffage] = useState(
    bien?.autresTypesChauffage ?? '',
  );
  const [typeEauChaude, setTypeEauChaude] = useState(bien?.typeEauChaude ?? '');
  const [equipementsDivers, setEquipementsDivers] = useState(
    bien?.equipementsDivers?.join(', ') ?? '',
  );
  const [equipementsNTIC, setEquipementsNTIC] = useState(
    bien?.equipementsNTIC?.join(', ') ?? '',
  );
  const [autresPieces, setAutresPieces] = useState(bien?.autresPieces ?? '');
  const [
    autresInformationsComplementaires,
    setAutresInformationsComplementaires,
  ] = useState(bien?.autresInformationsComplementaires ?? '');
  const { create, update } = useBienStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: BienInput = {
      typeBien,
      adresse,
      codePostal,
      ville,
      pays,
      numeroIdentifiantFiscal,
      dpe,
      regimeJuridique,
      surfaceHabitable: surfaceHabitable ? Number(surfaceHabitable) : undefined,
      nombrePieces: nombrePieces ? Number(nombrePieces) : undefined,
      anneeConstruction: anneeConstruction
        ? Number(anneeConstruction)
        : undefined,
      cuisine,
      nombreChambres: nombreChambres ? Number(nombreChambres) : undefined,
      nombreSejours: nombreSejours ? Number(nombreSejours) : undefined,
      nombreSallesDEau: nombreSallesDEau ? Number(nombreSallesDEau) : undefined,
      nombreSallesDeBains: nombreSallesDeBains
        ? Number(nombreSallesDeBains)
        : undefined,
      nombreWC: nombreWC ? Number(nombreWC) : undefined,
      typeChauffage,
      autresTypesChauffage,
      typeEauChaude,
      equipementsDivers: equipementsDivers
        ? equipementsDivers
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      equipementsNTIC: equipementsNTIC
        ? equipementsNTIC
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      autresPieces,
      autresInformationsComplementaires,
    };
    if (isEdit && bien) {
      await update(bien.id, payload);
    } else {
      await create(payload);
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
      <InputField
        label="Code postal"
        value={codePostal}
        onChange={setCodePostal}
      />
      <InputField label="Ville" value={ville} onChange={setVille} />
      <InputField label="Pays" value={pays} onChange={setPays} />
      <InputField
        label="Numéro fiscal"
        value={numeroIdentifiantFiscal}
        onChange={setNumeroIdentifiantFiscal}
      />
      <InputField label="DPE" value={dpe} onChange={setDpe} />
      <InputField
        label="Régime juridique"
        value={regimeJuridique}
        onChange={setRegimeJuridique}
      />
      <InputField
        label="Surface habitable"
        value={surfaceHabitable}
        onChange={setSurfaceHabitable}
        type="number"
      />
      <InputField
        label="Nombre de pièces"
        value={nombrePieces}
        onChange={setNombrePieces}
        type="number"
      />
      <InputField
        label="Année de construction"
        value={anneeConstruction}
        onChange={setAnneeConstruction}
        type="number"
      />
      <InputField label="Cuisine" value={cuisine} onChange={setCuisine} />
      <InputField
        label="Nombre de chambres"
        value={nombreChambres}
        onChange={setNombreChambres}
        type="number"
      />
      <InputField
        label="Nombre de séjours"
        value={nombreSejours}
        onChange={setNombreSejours}
        type="number"
      />
      <InputField
        label="Nombre de salles d'eau"
        value={nombreSallesDEau}
        onChange={setNombreSallesDEau}
        type="number"
      />
      <InputField
        label="Nombre de salles de bains"
        value={nombreSallesDeBains}
        onChange={setNombreSallesDeBains}
        type="number"
      />
      <InputField
        label="Nombre de WC"
        value={nombreWC}
        onChange={setNombreWC}
        type="number"
      />
      <InputField
        label="Type de chauffage"
        value={typeChauffage}
        onChange={setTypeChauffage}
      />
      <InputField
        label="Autres types de chauffage"
        value={autresTypesChauffage}
        onChange={setAutresTypesChauffage}
      />
      <InputField
        label="Type d'eau chaude"
        value={typeEauChaude}
        onChange={setTypeEauChaude}
      />
      <InputField
        label="Équipements divers"
        value={equipementsDivers}
        onChange={setEquipementsDivers}
      />
      <InputField
        label="Équipements NTIC"
        value={equipementsNTIC}
        onChange={setEquipementsNTIC}
      />
      <InputField
        label="Autres pièces"
        value={autresPieces}
        onChange={setAutresPieces}
      />
      <InputField
        label="Autres informations"
        value={autresInformationsComplementaires}
        onChange={setAutresInformationsComplementaires}
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
