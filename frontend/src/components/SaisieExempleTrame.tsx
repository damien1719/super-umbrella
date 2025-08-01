import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface SaisieExempleTrameProps {
  examples: string[];
  onAdd: (content: string) => void;
}

export default function SaisieExempleTrame({
  examples,
  onAdd,
}: SaisieExempleTrameProps) {
  const [text, setText] = useState('');

  const add = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <div className="space-y-4">
      {examples.length > 0 && (
        <div className="space-y-2">
          {examples.map((e, idx) => (
            <div
              key={idx}
              className="p-2 border rounded bg-gray-50 whitespace-pre-wrap"
            >
              {e}
            </div>
          ))}
        </div>
      )}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Coller votre exemple ici"
        className="min-h-32"
      />
      <Button
        onClick={add}
        disabled={!text.trim()}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Ajouter un exemple
      </Button>
    </div>
  );
}
