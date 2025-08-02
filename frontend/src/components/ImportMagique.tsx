import { useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const token = useAuth((s) => s.token);

  const transformTable = () => {
    const rows = text
      .trimEnd()
      .split(/\r?\n/)
      .filter(Boolean)
      .map((r) => r.split('\t'));
    if (rows.length === 0) return [];
    const header = rows[0];
    const colonnes = header
      .slice(1)
      .map((c) => c.trim())
      .filter(Boolean);
    const lignes = rows
      .slice(1)
      .map((r) => r[0].trim())
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
      } else {
        onDone(transformTable());
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
            onClick={() => setMode('liste')}
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
            onClick={() => setMode('tableau')}
          >
            Tableau
          </button>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] max-h-[50vh] w-full resize-y"
              placeholder={
                mode === 'liste'
                  ? 'Collez votre texte ici...'
                  : 'Collez votre tableau ici...'
              }
            />
          </div>
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
            disabled={loading || !text.trim()}
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
