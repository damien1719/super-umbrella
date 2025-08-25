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
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSectionStore } from '@/store/sections';
import { categories, type CategoryId } from '@/types/trame';
import { jobOptions, Job } from '@/types/job';

interface CreerTrameModalProps {
  trigger?: React.ReactNode;
  initialCategory?: string;
  onCreated?: (id: string) => void;
}

export default function CreerTrameModal({
  trigger,
  onCreated,
}: CreerTrameModalProps = {}) {
  const [open, setOpen] = useState(false);
  const [nomTrame, setNomTrame] = useState('');
  const [categorieSelectionnee, setCategorieSelectionnee] = useState<
    CategoryId | ''
  >('');
  const navigate = useNavigate();
  const createSection = useSectionStore((s) => s.create);
  const [jobs, setJobs] = useState<Job[]>([]);

  const handleCreerTrame = async () => {
    if (!nomTrame || !categorieSelectionnee || jobs.length === 0) return;
    const section = await createSection({
      title: nomTrame,
      kind: categorieSelectionnee,
      job: jobs,
    });
    if (onCreated) {
      onCreated(section.id);
    } else {
      navigate(`/creation-trame/${section.id}`);
    }
    setOpen(false);
    setNomTrame('');
    setCategorieSelectionnee('');
    setJobs([]);
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
              onValueChange={(v) => setCategorieSelectionnee(v as CategoryId)}
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

        <div className="space-y-2">
          <Label htmlFor="job">Métiers concernés</Label>
          <div className="border rounded p-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {jobs.map((j) => (
                <span
                  key={j}
                  className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded"
                >
                  {jobOptions.find((o) => o.id === j)?.label}
                  <button
                    type="button"
                    className="ml-1 text-primary-700"
                    onClick={() =>
                      setJobs((prev) => prev.filter((x) => x !== j))
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <Select
              onValueChange={(v) => {
                const val = v as Job;
                setJobs((prev) => (prev.includes(val) ? prev : [...prev, val]));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ajouter un métier" />
              </SelectTrigger>
              <SelectContent>
                {jobOptions.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.label}
                  </SelectItem>
                ))}
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
            disabled={!nomTrame || !categorieSelectionnee || jobs.length === 0}
            variant="primary"
          >
            Créer la trame
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
