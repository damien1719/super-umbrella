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
import { jobOptions, Job } from '@/types/job';

export interface CreateWithJobsModalProps {
  trigger?: React.ReactNode;
  dialogTitle?: string;
  nameLabel?: string;
  confirmLabel?: string;
  initialName?: string;
  initialJobs?: Job[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (payload: { name: string; jobs: Job[] }) => void;
  extra?: React.ReactNode; // e.g., additional fields (category, etc.)
}

export default function CreateWithJobsModal({
  trigger,
  dialogTitle = 'Créer',
  nameLabel = 'Nom',
  confirmLabel = 'Valider',
  initialName = '',
  initialJobs = [],
  open: openProp,
  onOpenChange,
  onSubmit,
  extra,
}: CreateWithJobsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  };

  const reset = () => {
    setName('');
    setJobs([]);
  };

  const handleValidate = () => {
    if (!name.trim() || jobs.length === 0) return;
    onSubmit({ name: name.trim(), jobs });
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        {trigger || <Button>{dialogTitle}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="cwjm-name">{nameLabel}</Label>
            <Input
              id="cwjm-name"
              placeholder="Ex: Mon Bilan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {extra}

          <div className="space-y-2">
            <Label htmlFor="cwjm-job">Métiers concernés</Label>
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
                      aria-label={`Retirer ${jobOptions.find((o) => o.id === j)?.label}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <Select
                onValueChange={(v) => {
                  const val = v as Job;
                  setJobs((prev) =>
                    prev.includes(val) ? prev : [...prev, val],
                  );
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
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleValidate}
            disabled={!name.trim() || jobs.length === 0}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
