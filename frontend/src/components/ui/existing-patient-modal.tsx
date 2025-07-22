'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  useEffect(() => {
    if (isOpen) {
      fetchAll().catch(() => {
        /* ignore */
      });
    }
  }, [isOpen, fetchAll]);

  const handleSelectPatient = (id: string) => {
    onPatientSelected(id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Patient existant</DialogTitle>
          <DialogDescription>
            Choisissez un patient dans la liste.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          <div className="grid gap-2">
            {items.map((patient) => (
              <Button
                key={patient.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSelectPatient(patient.id)}
              >
                {patient.firstName} {patient.lastName}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
