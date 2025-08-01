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
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Importe ta trame magiquement</DialogTitle>
      </DialogHeader>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-60"
      />
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} type="button">
          Annuler
        </Button>
        <Button onClick={handle} disabled={loading || !text} type="button">
          Transformer
        </Button>
      </DialogFooter>
    </div>
  );
}
