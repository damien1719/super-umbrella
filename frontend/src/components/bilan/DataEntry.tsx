import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2 } from 'lucide-react';
import type { Question, Answers } from '@/types/question';

interface DataEntryProps {
  questions: Question[];
  answers: Answers;
  onChange: (answers: Answers) => void;
}

export function DataEntry({ questions, answers, onChange }: DataEntryProps) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<Answers>({});

  useEffect(() => {
    setLocal(answers);
  }, [answers]);

  const answeredCount = Object.keys(answers).length;

  const save = () => {
    onChange(local);
    setOpen(false);
  };

  const renderQuestion = (q: Question) => {
    const value = local[q.id] ?? '';
    switch (q.type) {
      case 'notes':
        return (
          <Textarea
            value={String(value)}
            onChange={(e) => setLocal({ ...local, [q.id]: e.target.value })}
            placeholder={q.contenu}
            className="min-h-20"
          />
        );
      case 'choix-multiple':
        return (
          <Select
            value={String(value)}
            onValueChange={(v) => setLocal({ ...local, [q.id]: v })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {q.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'echelle':
        return (
          <Input
            type="number"
            value={String(value)}
            min={q.echelle?.min}
            max={q.echelle?.max}
            onChange={(e) => setLocal({ ...local, [q.id]: e.target.value })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs font-medium text-gray-700">Réponses</Label>
        {answeredCount > 0 && (
          <Badge variant="outline" className="text-xs">
            {answeredCount}/{questions.length}
          </Badge>
        )}
      </div>
      {answeredCount === 0 ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-3 w-3 mr-2" /> Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Répondre
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <Label className="text-sm font-medium">{q.titre}</Label>
                  {renderQuestion(q)}
                </div>
              ))}
              <Button onClick={save} className="w-full mt-4">
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="text-xs text-gray-600 mb-2">
              Réponses enregistrées
            </div>
            {questions.slice(0, 2).map((q) => (
              <div key={q.id} className="text-xs text-gray-700 truncate">
                • {q.titre}
              </div>
            ))}
            {answeredCount > 2 && (
              <div className="text-xs text-gray-500">
                +{answeredCount - 2} autres...
              </div>
            )}
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
              >
                <Edit2 className="h-3 w-3 mr-2" /> Modifier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Modifier les réponses
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <Label className="text-sm font-medium">{q.titre}</Label>
                    {renderQuestion(q)}
                  </div>
                ))}
                <Button onClick={save} className="w-full mt-4">
                  Sauvegarder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
