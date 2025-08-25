import { useRef, useState, useEffect } from 'react';
import { read, utils } from 'xlsx';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/store/auth';

interface ImportNotesProps {
  onChange: (text: string) => void;
  onImageChange?: (imageBase64: string | undefined) => void;
}

export default function ImportNotes({
  onChange,
  onImageChange,
}: ImportNotesProps) {
  const [mode, setMode] = useState<'text' | 'excel' | 'image'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const token = useAuth((s) => s.token);

  useEffect(() => {
    if (mode === 'text') {
      onChange(text);
      onImageChange?.(undefined);
    } else if (mode === 'excel' && file) {
      onImageChange?.(undefined);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = reader.result as ArrayBuffer;
          const workbook = read(data, { type: 'array' });
          const csv = workbook.SheetNames.map((name) =>
            utils.sheet_to_csv(workbook.Sheets[name]),
          ).join('\n');
          onChange(csv);
        } catch {
          onChange('');
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (mode === 'image' && image) {
      const reader = new FileReader();
      reader.onload = async () => {
        const res = reader.result as string;
        const base64 = res.split(',')[1] || '';

        // Notifier l'image en base64
        console.log('[DEBUG] ImportNotes - onImageChange called with base64:', {
          hasBase64: !!base64,
          base64Length: base64.length,
          preview: base64.substring(0, 100) + '...',
        });
        onImageChange?.(base64);

        try {
          const r = await apiFetch<{
            result: Array<{ tableau?: { columns: any[]; rowsGroups: any[] } }>;
          }>('/api/v1/import/transform-image', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ image: base64 }),
          });
          const q = r.result[0];
          if (q?.tableau?.columns && q.tableau.rowsGroups) {
            const header = q.tableau.columns
              .map((c: any) => c.label)
              .join(' | ');
            const sep = q.tableau.columns.map(() => '---').join(' | ');
            const rows = q.tableau.rowsGroups
              .flatMap((g: any) => g.rows || [])
              .map((row: any) => row.label)
              .join(' | ');
            const md = `| ${header} |\n| ${sep} |\n| ${rows} |`;
            onChange(md);
          } else {
            onChange(base64);
          }
        } catch {
          onChange(base64);
        }
      };
      reader.readAsDataURL(image);
    } else {
      onImageChange?.(undefined);
    }
  }, [mode, text, file, image, onChange, onImageChange, token]);

  return (
    <div className="space-y-4 w-full">
      <RadioGroup
        value={mode}
        onValueChange={(v) => {
          setMode(v as 'text' | 'excel' | 'image');
          setFile(null);
          setImage(null);
          setText('');
        }}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="text" id="notes-text" />
          <label htmlFor="notes-text">Texte</label>
        </div>
        {/*         <div className="flex items-center space-x-2">
          <RadioGroupItem value="excel" id="notes-excel" />
          <label htmlFor="notes-excel">Excel</label>
        </div> */}
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="image" id="notes-image" />
          <label htmlFor="notes-image">Image</label>
        </div>
      </RadioGroup>

      {mode === 'text' && (
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Collez vos notes ici"
          className="h-64"
        />
      )}

      {mode === 'excel' && (
        <div className="space-y-2">
          <Button type="button" onClick={() => fileInputRef.current?.click()}>
            Importer un fichier Excel
          </Button>
          <input
            type="file"
            accept=".xlsx,.xls"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file && <div className="text-sm text-gray-600">{file.name}</div>}
        </div>
      )}

      {mode === 'image' && (
        <div className="space-y-2">
          <Button type="button" onClick={() => imageInputRef.current?.click()}>
            Ajouter une image
          </Button>
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            className="hidden"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          {image && <div className="text-sm text-gray-600">{image.name}</div>}
        </div>
      )}
    </div>
  );
}
