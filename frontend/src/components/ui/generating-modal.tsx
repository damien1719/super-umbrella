'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface GeneratingModalProps {
  open: boolean;
}

export default function GeneratingModal({ open }: GeneratingModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Génération en cours...</p>
      </DialogContent>
    </Dialog>
  );
}
