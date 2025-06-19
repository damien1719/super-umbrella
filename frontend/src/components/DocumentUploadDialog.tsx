import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

const TYPES = [
  'BAIL',
  'DPE',
  'ETAT_DES_LIEUX',
  'FACTURE',
  'PHOTO',
  'LOCATAIRE_ID',
  'JUSTIF_DOMICILE',
  'AUTRE',
];

interface Props {
  onUpload: (file: File, type: string) => void;
}

export function DocumentUploadDialog({ onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('AUTRE');
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Ajouter</Button>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <div
          className="border-2 border-dashed p-4 text-center cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setFile(e.dataTransfer.files[0]);
          }}
          onClick={() => inputRef.current?.click()}
        >
          {file ? file.name : 'Déposez un fichier ou cliquez pour sélectionner'}
        </div>
        <Input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <select
          className="border rounded p-2 w-full"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="text-right">
          <Button
            type="button"
            onClick={() => {
              if (file) onUpload(file, type);
            }}
          >
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
