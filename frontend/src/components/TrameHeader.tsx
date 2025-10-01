import {
  ArrowLeft,
  FeatherIcon,
  GlassWaterIcon,
  ScanLineIcon,
  SparklesIcon,
  TextSearchIcon,
} from 'lucide-react';
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
  onOpenInspiration?: () => void;
  // New for save UX
  isDirty?: boolean;
  saving?: boolean;
  lastSavedAt?: string | null;
  onTestGeneration?: () => void;
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
    onOpenInspiration = () => {},
    isDirty = false,
    saving = false,
    lastSavedAt = null,
    onTestGeneration = () => {},
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
        className={`text-2xl font-bold text-gray-900 flex-1 max-w-[500px] ${readOnly ? 'opacity-60 pointer-events-none' : ''}`}
        disabled={readOnly}
      />
      {!readOnly ? (
        <>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => onPublicChange(e.target.checked)}
                aria-label="Partager la trame"
              />
              <Label className="text-md text-gray-700">Partager</Label>
            </div>
            <div className="text-sm text-gray-600">
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  Enregistrement…
                </span>
              ) : isDirty ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                  Modifications non enregistrées
                </span>
              ) : lastSavedAt ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                  Enregistré
                </span>
              ) : null}
            </div>
            <Button
              onClick={onSave}
              variant="primary"
              disabled={!isDirty || saving}
            >
              Enregistrer
            </Button>
          </div>
          <Button variant="outline" onClick={onOpenInspiration}>
            <TextSearchIcon className="h-4 w-4 mr-2" />
            Explorer
          </Button>
          <Button variant="outline" onClick={onImport}>
            <SparklesIcon className="h-4 w-4 mr-2" />
            Import Magique
          </Button>
          <Button variant="outline" onClick={onTestGeneration}>
            <FeatherIcon className="h-4 w-4 mr-2" />
            Rédiger
          </Button>
          {showAdminImport && (
            <Button variant="primary" onClick={onAdminImport}>
              Admin Import
            </Button>
          )}
        </>
      ) : (
        <div className="ml-auto flex items-center gap-2">
          <span className="text-base text-gray-600 p-4">
            Mode lecture seule
          </span>
          <Button onClick={onDuplicate} variant="primary">
            Créer sa version
          </Button>
        </div>
      )}
    </div>
  );
}
