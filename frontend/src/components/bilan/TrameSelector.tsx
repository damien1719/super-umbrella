import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, X } from 'lucide-react';

export interface TrameOption {
  value: string;
  label: string;
  description?: string | null;
  schema?: unknown;
  isPublic?: boolean;
  authorId?: string | null;
  author?: { prenom?: string | null } | null;
  templateRefId?: string | null;
}

export interface TrameExample {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface TrameSelectorProps {
  options: TrameOption[];
  value: string;
  onChange: (value: string) => void;
  examples: TrameExample[];
  onAddExample: (example: Omit<TrameExample, 'id'>) => void;
  onRemoveExample: (id: string) => void;
}

export function TrameSelector({
  options,
  value,
  onChange,
  examples,
  onAddExample,
  onRemoveExample,
}: TrameSelectorProps) {
  const [open, setOpen] = useState(false);
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

  const selected = options.find((o) => o.value === value);

  return (
    <div className="mb-4">
      <Label className="text-xs font-medium text-gray-700 mb-2 block">
        Trame choisie :
      </Label>
      <div className="flex items-center gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs flex-1">
            <SelectValue>{selected?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((trame) => (
              <SelectItem key={trame.value} value={trame.value}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{trame.label}</div>
                    <div className="text-xs text-gray-500">
                      {trame.description}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
            >
              <BookOpen className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Exemples pour la trame :{' '}
                {selected?.label}
              </DialogTitle>
              <DialogDescription>
                Gérez les exemples et modèles pour cette trame spécifique
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {examples.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Exemples existants :
                  </Label>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {examples.map((example) => (
                      <div
                        key={example.id}
                        className="p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="font-medium text-sm">
                            {example.title}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRemoveExample(example.id)}
                            className="h-5 w-5 p-0 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700">
                          {example.content}
                        </p>
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
                  <Label className="text-xs">Titre de l&apos;exemple</Label>
                  <Textarea
                    value={newExample.title}
                    onChange={(e) =>
                      setNewExample({ ...newExample, title: e.target.value })
                    }
                    placeholder="Ex: Questions sur le développement moteur"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Contenu de l&apos;exemple</Label>
                  <Textarea
                    value={newExample.content}
                    onChange={(e) =>
                      setNewExample({ ...newExample, content: e.target.value })
                    }
                    placeholder="Décrivez l'exemple..."
                    className="min-h-20"
                  />
                </div>
                <div>
                  <Label className="text-xs">Catégorie</Label>
                  <Select
                    value={newExample.category}
                    onValueChange={(v) =>
                      setNewExample({ ...newExample, category: v })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Général</SelectItem>
                      <SelectItem value="motricite">Motricité</SelectItem>
                      <SelectItem value="cognitif">Cognitif</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="sensoriel">Sensoriel</SelectItem>
                    </SelectContent>
                  </Select>
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
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
