'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Feather } from 'lucide-react';

interface GeneratingModalProps {
  open: boolean;
}

export default function GeneratingModal({ open }: GeneratingModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col items-center gap-4 p-6"
      >
        {/* Animation plume qui "respire" */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <Feather className="h-10 w-10 text-primary" />
        </motion.div>

        {/* Petit texte qui change doucement */}
        <motion.p
          className="text-center text-muted-foreground"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Bilan plume rédige un 1e jet...
        </motion.p>
      </DialogContent>
    </Dialog>
  );
}
