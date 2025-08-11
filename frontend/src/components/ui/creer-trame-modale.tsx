'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSectionStore } from '@/store/sections';
import { categories } from '@/types/trame';

interface CreerTrameModalProps {
  trigger?: React.ReactNode;
  initialCategory?: string;
  onCreated?: (id: string) => void;
}

export default function CreerTrameModal({
  trigger,
  initialCategory = '',
  onCreated,
}: CreerTrameModalProps = {}) {
  const [open, setOpen] = useState(false);
  const [nomTrame, setNomTrame] = useState('');
  const [categorieSelectionnee, setCategorieSelectionnee] =
    useState(initialCategory);
  const navigate = useNavigate();
  const createSection = useSectionStore((s) => s.create);

  const handleCreerTrame = async () => {
    if (!nomTrame || !categorieSelectionnee) return;
    const section = await createSection({
      title: nomTrame,
      kind: categorieSelectionnee,
    });
    if (onCreated) {
      onCreated(section.id);
    } else {
      navigate(`/creation-trame/${section.id}`);
    }
    setOpen(false);
    setNomTrame('');
    setCategorieSelectionnee(initialCategory);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Créer sa trame
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle trame</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nom-trame">Nom de la trame</Label>
            <Input
              id="nom-trame"
              placeholder="Ex: Anamnèse développementale personnalisée"
              value={nomTrame}
              onChange={(e) => setNomTrame(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categorie">Catégorie</Label>
            <Select
              value={categorieSelectionnee}
              onValueChange={setCategorieSelectionnee}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {category.title}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleCreerTrame}
            disabled={!nomTrame || !categorieSelectionnee}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Créer la trame
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
