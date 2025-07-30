import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import type { TrameExample } from './TrameSelector';

interface ExampleManagerProps {
  examples: TrameExample[];
  onAddExample: (example: Omit<TrameExample, 'id'>) => void;
  onRemoveExample: (id: string) => void;
}

export function ExampleManager({
  examples,
  onAddExample,
  onRemoveExample,
}: ExampleManagerProps) {
  const [newExample, setNewExample] = useState({
    title: '',
    content: '',
    category: 'general',
  });

  const addExample = () => {
    if (!newExample.title || !newExample.content) return;
    onAddExample(newExample);
    setNewExample({ title: '', content: '', category: 'general' });
  };

  return (
    <div className="space-y-4">
      {examples.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Exemples existants :</Label>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {examples.map((example) => (
              <div
                key={example.id}
                className="p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-medium text-sm">{example.title}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveExample(example.id)}
                    className="h-5 w-5 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-gray-700">{example.content}</p>
                <Badge variant="outline" className="text-xs mt-2">
                  {example.category}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Ajouter un nouvel exemple :
        </Label>
        <div>
          <Textarea
            value={newExample.content}
            onChange={(e) =>
              setNewExample({ ...newExample, content: e.target.value })
            }
            placeholder="Décrivez l'exemple..."
            className="min-h-20"
          />
        </div>
        <Button
          onClick={addExample}
          disabled={!newExample.title || !newExample.content}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> Ajouter l&apos;exemple
        </Button>
      </div>
    </div>
  );
}

export default ExampleManager;
