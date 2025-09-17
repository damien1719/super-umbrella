import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  title: string;
  isPublic: boolean;
  onTitleChange: (v: string) => void;
  onPublicChange: (v: boolean) => void;
  onSave: () => void;
  onImport: () => void;
  onBack: () => void;
  onAdminImport?: () => void;
  showAdminImport?: boolean;
  readOnly?: boolean;
  onDuplicate?: () => void;
}

export default function TrameHeader(p?: Partial<Props>) {
  const {
    title = '',
    isPublic = false,
    onTitleChange = () => {},
    onPublicChange = () => {},
    onSave = () => {},
    onImport = () => {},
    onBack = () => {},
    onAdminImport = () => {},
    showAdminImport = false,
    readOnly = false,
    onDuplicate = () => {},
  } = p || {};

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Titre de la trame"
        className={`text-2xl font-bold text-gray-900 flex-1 ${readOnly ? 'opacity-60 pointer-events-none' : ''}`}
        disabled={readOnly}
      />
      {!readOnly && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => onPublicChange(e.target.checked)}
            aria-label="Partager la trame"
          />
          <Label className="text-md text-gray-700">Partager</Label>
        </div>
      )}
      {!readOnly ? (
        <>
          <Button onClick={onSave} variant="primary" className="ml-auto">
            Sauvegarder la trame
          </Button>
          <Button variant="outline" onClick={onImport}>
            Import Magique
          </Button>
          {showAdminImport && (
            <Button variant="primary" onClick={onAdminImport}>
              Admin Import
            </Button>
          )}
        </>
      ) : (
        <Button onClick={onDuplicate} variant="primary" className="ml-auto">
          Dupliquer la trame
        </Button>
      )}
    </div>
  );
}
