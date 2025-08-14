import { useRef, useState } from 'react';
import { read, utils } from 'xlsx';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';
import type { Question, ColumnDef, Row } from '@/types/question';
import { Loader2 } from 'lucide-react';

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
  const [tableImportType, setTableImportType] = useState<
    'text' | 'image' | 'excel'
  >('text');
  const [html, setHtml] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const token = useAuth((s) => s.token);

  const addDefaultValueType = (questions: Question[]): Question[] =>
    questions.map((q) =>
      q.type === 'tableau' && q.tableau
        ? {
            ...q,
            tableau: {
              ...q.tableau,
              columns: q.tableau.columns.map((c) => ({
                ...c,
                valueType: c.valueType ?? 'text',
              })),
            },
          }
        : q,
    );

  const transformTable = (rows: (string | number)[][]) => {
    if (rows.length === 0) return [];
    const header = rows[0];
    const columns: ColumnDef[] = header
      .slice(1)
      .map((c, idx) => ({
        id: `c${idx}`,
        label: String(c).trim(),
        valueType: 'text' as const,
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
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: text }),
          },
        );
        onDone(res.result);
      } else if (tableImportType === 'excel' && file) {
        const data = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(file);
        });
        const workbook = read(data, { type: 'array' });
        const results: Question[] = [];
        for (const name of workbook.SheetNames) {
          const sheet = workbook.Sheets[name];
          const html = utils.sheet_to_html(sheet);
          const res = await apiFetch<{ result: Question[] }>(
            '/api/v1/import/transform-excel-table',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ sheetName: name, html }),
            },
          );
          results.push(...addDefaultValueType(res.result));
        }
        onDone(results);
      } else if (tableImportType === 'image' && image) {
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
        onDone(addDefaultValueType(res.result));
      } else if (tableImportType === 'text' && (text.trim() || html.trim())) {
        const res = await apiFetch<{ result: Question[] }>(
          '/api/v1/import/transform-text-table',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: text }),
          },
        );
        onDone(addDefaultValueType(res.result));
      }
    } catch {
      alert("Nous n'avons pas pu transformé votre tableau");
    } finally {
      setLoading(false);
      onCancel();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[100vh] w-full max-w-3xl mx-auto">
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
          <p className="text-sm text-muted-foreground">
            <span role="img" aria-label="sparkles">
              ✨
            </span>{' '}
            Collez simplement un document Word à partir de votre trame
            habituelle : il sera automatiquement importé et prêt à être utilisé
            dans l’application.
          </p>
          {mode === 'liste' ? (
            <div className="relative">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] max-h-[50vh] w-full overflow-y-auto resize-none"
                placeholder="Collez votre texte ici..."
              />
            </div>
          ) : (
            <>
              <RadioGroup
                value={tableImportType}
                onValueChange={(value) =>
                  setTableImportType(value as 'text' | 'image' | 'excel')
                }
                className="flex gap-4 mb-4"
                name="mode"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="radio-text" />
                  <label htmlFor="radio-text" className="text-sm">
                    Copier–coller un texte issu de Word ou Excel
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="radio-image" />
                  <label htmlFor="radio-image" className="text-sm">
                    Importer une image
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="radio-excel" />
                  <label htmlFor="radio-excel" className="text-sm">
                    Importer un Excel
                  </label>
                </div>
              </RadioGroup>
              {tableImportType === 'text' && (
                <Textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setHtml('');
                    setFile(null);
                    setImage(null);
                  }}
                  className="min-h-[200px] max-h-[50vh] w-full overflow-y-auto resize-none"
                  placeholder="Collez votre tableau ici..."
                />
              )}
              {tableImportType === 'excel' && (
                <div className="flex flex-col gap-2 items-center justify-center min-h-[200px] max-h-[50vh] w-full rounded-md">
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
                  {file ? (
                    <input
                      type="text"
                      value={file.name}
                      readOnly
                      className="border rounded px-3 py-2 bg-gray-50 text-gray-700 w-full max-w-xs"
                      style={{ cursor: 'default' }}
                    />
                  ) : (
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      +Choisir un fichier
                    </Button>
                  )}
                </div>
              )}
              {tableImportType === 'image' && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
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
                    <div className="w-full flex items-center justify-center flex-col gap-2">
                      <div
                        tabIndex={0}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.files?.[0];
                          if (pasted) {
                            setImage(pasted);
                            setFile(null);
                            setHtml('');
                            setText('');
                          }
                        }}
                        className="border rounded px-3 py-2 text-sm text-muted-foreground w-full max-w-xs text-center flex items-center justify-center w-full max-w-md  h-[200px]"
                        data-testid="image-paste-zone"
                      >
                        Cliquez ici pour copier coller une image
                      </div>
                      {image ? (
                        <input
                          type="text"
                          value={image.name}
                          readOnly
                          className="border rounded px-3 py-2 bg-gray-50 text-gray-700 w-full max-w-xs"
                          style={{ cursor: 'default' }}
                        />
                      ) : (
                        <Button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          +Choisir une image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="px-6 py-4 bg-muted/20">
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
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                'Importer'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
