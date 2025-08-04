import { useRef, useState } from 'react';
import { read, utils } from 'xlsx';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';
import type { Question } from '@/types/question';

interface ImportMagiqueProps {
  onDone: (questions: Question[]) => void;
  onCancel: () => void;
}

export default function ImportMagique({
  onDone,
  onCancel,
}: ImportMagiqueProps) {
  const [mode, setMode] = useState<'liste' | 'tableau'>('liste');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const token = useAuth((s) => s.token);

  const transformTable = (rows: (string | number)[][]) => {
    if (rows.length === 0) return [];
    const header = rows[0];
    const colonnes = header
      .slice(1)
      .map((c) => String(c).trim())
      .filter(Boolean);
    const lignes = rows
      .slice(1)
      .map((r) => String(r[0]).trim())
      .filter(Boolean);
    return [
      {
        id: Date.now().toString(),
        type: 'tableau' as const,
        titre: 'Question sans titre',
        tableau: { lignes, colonnes },
      },
    ];
  };

  const handle = async () => {
    setLoading(true);
    try {
      if (mode === 'liste') {
        const res = await apiFetch<{ result: Question[] }>(
          '/api/v1/import/transform',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ content: text }),
          },
        );
        onDone(res.result);
      } else if (file) {
        const data = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(file);
        });
        const workbook = read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = utils.sheet_to_json<(string | number)[]>(sheet, {
          header: 1,
        }) as (string | number)[][];
        onDone(transformTable(rows));
      } else if (image) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            const b64 = res.split(',')[1] || '';
            resolve(b64);
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(image);
        });
        const res = await apiFetch<{ result: Question[] }>(
          '/api/v1/import/transform-image',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ image: base64 }),
          },
        );
        onDone(res.result);
      }
    } finally {
      setLoading(false);
      onCancel();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] w-full max-w-2xl mx-auto">
      <div className="px-6 pt-6 pb-4">
        <DialogHeader className="mb-4">
          <DialogTitle>Importe ta trame magiquement</DialogTitle>
        </DialogHeader>
        <div className="mb-4 flex border-b">
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium',
              mode === 'liste'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground',
            )}
            onClick={() => {
              setMode('liste');
              setFile(null);
              setImage(null);
            }}
          >
            Liste de questions
          </button>
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium',
              mode === 'tableau'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground',
            )}
            onClick={() => {
              setMode('tableau');
              setText('');
              setFile(null);
              setImage(null);
            }}
          >
            Tableau
          </button>
        </div>
        <div className="space-y-4">
          {mode === 'liste' ? (
            <div className="relative">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] max-h-[50vh] w-full resize-y"
                placeholder="Collez votre texte ici..."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-center justify-center min-h-[200px] max-h-[50vh] w-full border-2 border-dashed rounded-md">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setImage(null);
                }}
                className="hidden"
                data-testid="file-input"
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/heic,image/heif,image/webp"
                onChange={(e) => {
                  setImage(e.target.files?.[0] ?? null);
                  setFile(null);
                }}
                className="hidden"
                data-testid="image-input"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  +Choisir un fichier
                </Button>
                <Button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                >
                  +Choisir une image
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-6 py-4 border-t bg-muted/20">
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            type="button"
            className="min-w-[100px]"
          >
            Annuler
          </Button>
          <Button
            onClick={handle}
            disabled={
              loading || (mode === 'liste' ? !text.trim() : !file && !image)
            }
            type="button"
            className="min-w-[120px]"
          >
            {loading ? 'Traitement...' : 'Transformer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
