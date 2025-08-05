import { useRef, useState } from 'react';
import { read, utils } from 'xlsx';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';
import type { Question, ColumnDef, Row } from '@/types/question';

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
  const [html, setHtml] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const token = useAuth((s) => s.token);

  const transformTable = (rows: (string | number)[][]) => {
    if (rows.length === 0) return [];
    const header = rows[0];
    const columns: ColumnDef[] = header
      .slice(1)
      .map((c, idx) => ({
        id: `c${idx}`,
        label: String(c).trim(),
        valueType: 'text',
      }))
      .filter((c) => c.label);
    const lignes: Row[] = rows
      .slice(1)
      .map((r, idx) => ({ id: `r${idx}`, label: String(r[0]).trim() }))
      .filter((r) => r.label);
    return [
      {
        id: Date.now().toString(),
        type: 'tableau' as const,
        titre: 'Question sans titre',
        tableau: { columns, sections: [{ id: 's1', title: '', rows: lignes }] },
      },
    ];
  };

  const handleTransformToTable = async () => {
    if (!text.trim()) return;
    
    setIsTransforming(true);
    try {
      const res = await apiFetch<{ result: Question[] }>(
        '/api/v1/import/transform-text-table',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ content: text }),
        },
      );

      console.log("res", res);
      
      onDone(res.result);
      onCancel();
    } catch (error) {
      console.error('Erreur lors de la transformation en tableau:', error);
    } finally {
      setIsTransforming(false);
    }
  };

  /// DETTE ANCIEN FORMAT DE TABLEAU ///

  const handle = async () => {
    setLoading(true);
    try {
      if (mode === 'liste') {
        const res = await apiFetch<{ result: Question[] }>(
          '/api/v1/import/transform',
          {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
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
      } else if (text.trim() || html.trim()) {
        const res = await apiFetch<{ result: Question[] }>(
          '/api/v1/import/transform-text-table',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ content: html || text }),
          },
        );
        onDone(res.result);
      }
    } catch {
      alert("Nous n'avons pas pu transformé votre tableau");
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
              setHtml('');
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
                className="min-h-[200px] max-h-[50vh] w-full overflow-y-auto resize-none"
                placeholder="Collez votre texte ici..."
              />
              <div className="mt-2 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleTransformToTable}
                  disabled={!text.trim() || isTransforming}
                >
                  {isTransforming ? 'Transformation...' : 'Transformer en tableau'}
                </Button>
                <Button 
                  onClick={handle} 
                  disabled={!text.trim() || loading}
                >
                  {loading ? 'Traitement...' : 'Valider'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onPaste={(e) => {
                  const items = Array.from(e.clipboardData.items);
                  for (const item of items) {
                    if (item.type.startsWith('image/')) {
                      const f = item.getAsFile();
                      if (f) {
                        setImage(f);
                        setFile(null);
                        setText('');
                        setHtml('');
                        e.preventDefault();
                        return;
                      }
                    }
                  }
                  const htmlData = e.clipboardData.getData('text/html');
                  const plain = e.clipboardData.getData('text/plain');
                  setHtml(htmlData);
                  setText(plain);
                }}
                className="min-h-[200px] max-h-[50vh] w-full resize-y"
                placeholder="Copier-coller votre tableau ici..."
              />
              <div className="mt-2 flex justify-end">
                <Button 
                  onClick={handle} 
                  disabled={!text.trim() || loading}
                >
                  {loading ? 'Traitement...' : 'Valider'}
                </Button>
              </div>
              <div className="flex flex-col gap-2 items-center justify-center min-h-[200px] max-h-[50vh] w-full border-2 border-dashed rounded-md">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setImage(null);
                    setHtml('');
                    setText('');
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
                    setHtml('');
                    setText('');
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
            </>
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
              loading ||
              (mode === 'liste'
                ? !text.trim()
                : !file && !image && !text.trim() && !html.trim())
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
