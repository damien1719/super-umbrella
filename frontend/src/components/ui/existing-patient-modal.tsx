'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePatientStore } from '@/store/patients';

interface ExistingPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientSelected: (id: string) => void;
}

export function ExistingPatientModal({
  isOpen,
  onClose,
  onPatientSelected,
}: ExistingPatientModalProps) {
  const { items, fetchAll } = usePatientStore();
  const [patientId, setPatientId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAll().catch(() => {
        /* ignore */
      });
    }
  }, [isOpen, fetchAll]);

  const handleSelect = () => {
    if (patientId) {
      onPatientSelected(patientId);
      onClose();
      setPatientId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choisir un patient</DialogTitle>
          <DialogDescription>
            Sélectionnez le patient concerné par le bilan.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select
            value={patientId ?? ''}
            onValueChange={(v) => setPatientId(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Patient" />
            </SelectTrigger>
            <SelectContent>
              {items.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={handleSelect} disabled={!patientId}>
            Sélectionner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
