'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreationBilanProps {
  isOpen: boolean;
  onClose: () => void;
  onNewPatient: (title: string) => void;
  onExistingPatient: (title: string) => void;
  hasPatients: boolean;
}

export function CreationBilan({
  isOpen,
  onClose,
  onNewPatient,
  onExistingPatient,
  hasPatients,
}: CreationBilanProps) {
  const [title, setTitle] = useState('');

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Créer un nouveau bilan</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="bilan-title">Titre du bilan</Label>
          <Input
            id="bilan-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
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
          {hasPatients && (
            <Button
              type="button"
              onClick={() => {
                onExistingPatient(title);
                handleClose();
              }}
            >
              Patient existant
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
