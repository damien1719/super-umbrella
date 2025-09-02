'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Job } from '@/types/job';
import CreateWithJobsModal from '@/components/ui/create-with-jobs-modal';

interface CreerTrameModalProps {
  trigger?: React.ReactNode;
  initialCategory?: string;
  onCreated?: (id: string) => void;
}

export default function CreerTrameModal({
  trigger,
  onCreated,
}: CreerTrameModalProps = {}) {
  const [categorieSelectionnee, setCategorieSelectionnee] = useState<
    CategoryId | ''
  >('');
  const navigate = useNavigate();
  const createSection = useSectionStore((s) => s.create);

  return (
    <CreateWithJobsModal
      dialogTitle="Créer une nouvelle trame"
      nameLabel="Nom de la trame"
      confirmLabel="Créer la trame"
      trigger={
        trigger || (
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Créer sa trame
          </Button>
        )
      }
      extra={
        <div className="space-y-2">
          <span className="text-sm font-medium">Catégorie</span>
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
      }
      onSubmit={async ({ name, jobs }) => {
        if (!name || !categorieSelectionnee || jobs.length === 0) return;
        const section = await createSection({
          title: name,
          kind: categorieSelectionnee,
          job: jobs as Job[],
        });
        if (onCreated) onCreated(section.id);
        else navigate(`/creation-trame/${section.id}`);
        // reset local category after navigation
        setCategorieSelectionnee('');
      }}
    />
  );
}
