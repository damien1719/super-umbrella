'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { usePatientStore } from '@/store/patients';

interface CreationBilanProps {
  isOpen: boolean;
  onClose: () => void;
  onNewPatient: (title: string) => void;
  onExistingPatient: (title: string, patientId: string) => void;
  hasPatients: boolean;
  defaultValue?: string;
}

export function CreationBilan({
  isOpen,
  onClose,
  onNewPatient,
  onExistingPatient,
  hasPatients,
  defaultValue = 'Mon bilan',
}: CreationBilanProps) {
  const [title, setTitle] = useState(defaultValue);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const { items: patients, fetchAll } = usePatientStore();

  useEffect(() => {
    if (isOpen) {
      fetchAll().catch(() => {
        /* ignore */
      });
    }
  }, [isOpen, fetchAll]);

  const handleClose = () => {
    setTitle(defaultValue);
    setSelectedPatientId('');
    onClose();
  };

  const handleExistingPatient = () => {
    if (selectedPatientId) {
      onExistingPatient(title, selectedPatientId);
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Créer un nouveau bilan</DialogTitle>
          <DialogDescription>Choisissez un patient et personnalisez le titre avant de continuer.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bilan-title">Titre du bilan</Label>
            <Input
              id="bilan-title"
              defaultValue={defaultValue}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {hasPatients && (
            <div className="space-y-2">
              <Label htmlFor="patient-select">Mes patients</Label>
              <Select
                value={selectedPatientId}
                onValueChange={setSelectedPatientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onNewPatient(title);
              handleClose();
            }}
          >
            Nouveau patient
          </Button>
          <Button
            type="button"
            onClick={handleExistingPatient}
            disabled={!selectedPatientId}
          >
            Créer un bilan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
