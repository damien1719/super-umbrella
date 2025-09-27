'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { usePatientStore } from '@/store/patients';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (id: string) => void;
}

export function NewPatientModal({
  isOpen,
  onClose,
  onPatientCreated,
}: NewPatientModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { create } = usePatientStore();

  const handleSave = async () => {
    const patient = await create({ firstName, lastName });
    onPatientCreated(patient.id);
    onClose();
    setFirstName('');
    setLastName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Nouveau patient</DialogTitle>
          <DialogDescription>Indiquer un prénom</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              Prénom
            </Label>
            <Input
              id="firstName"
              value={firstName}
              placeholder="Thomas"
              onChange={(e) => setFirstName(e.target.value)}
              className="col-span-3"
            />
          </div>
          {/*           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Nom
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="col-span-3"
            />
          </div> */}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Créer un bilan pour ce patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
