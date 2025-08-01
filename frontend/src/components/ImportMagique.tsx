import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/store/auth';
import type { Question } from '@/types/question';

interface ImportMagiqueProps {
  onDone: (questions: Question[]) => void;
  onCancel: () => void;
}

export default function ImportMagique({
  onDone,
  onCancel,
}: ImportMagiqueProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const token = useAuth((s) => s.token);

  const handle = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ result: Question[] }>(
        '/api/v1/import/transform',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content: text }),
        },
      );
      onDone(res.result);
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
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] max-h-[50vh] w-full resize-y"
              placeholder="Collez votre texte ici..."
            />
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t bg-muted/20">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} type="button" className="min-w-[100px]">
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
