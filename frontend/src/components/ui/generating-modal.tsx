'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather } from 'lucide-react';

interface GeneratingModalProps {
  open: boolean;
  /** Chemin vers ton logo (ex: /assets/plume-logo.svg). Si non fourni, on affiche une plume Lucide. */
  logoSrc?: string;
  /** Liste des messages à faire défiler */
  phrases?: string[];
  /** Durée "indicative" d'attente pour la barre de progression (ms) */
  approxDurationMs?: number;
}

export default function GeneratingModal({
  open,
  logoSrc,
  phrases = [
    'Bilan Plume rédige un 1ᵉʳ jet…',
    'Écriture du document Word…',
    'Analyse du questionnaire rempli…',
    'Affinage du style et de la mise en page…',
  ],
  approxDurationMs = 60000,
}: GeneratingModalProps) {
  // cadence d’affichage des phrases
  const stepMs = 2200;
  const [index, setIndex] = useState(0);

  // reset à l’ouverture
  useEffect(() => {
    if (!open) return;
    setIndex(0);
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, stepMs);
    return () => clearInterval(id);
  }, [open, phrases.length]);

  // Progression linéaire sur approxDurationMs
  const progressKey = useMemo(() => (open ? Date.now() : 0), [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-md flex-col items-center gap-6 p-6"
      >
        {/* Logo animé (ou fallback plume) */}
        <div className="relative">
          {logoSrc ? (
            <motion.img
              src="/logo.png"
              alt="Logo Plume"
              className="h-14 w-14 select-none"
              draggable={false}
              animate={{ y: [0, -6, 0], rotate: [0, -1, 0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            />
          ) : (
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <Feather className="h-10 w-10 text-primary" />
            </motion.div>
          )}
        </div>

        {/* Phrase qui défile */}
        <div className="min-h-[2.25rem] w-full text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 1 }}
              className="text-sm text-muted-foreground"
              aria-live="polite"
            >
              {phrases[index]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Barre de progression douce (indicative) */}
        <div className="w-full">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              key={progressKey}
              className="h-full rounded-full bg-primary/80"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: approxDurationMs / 1000, ease: 'easeInOut' }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Bilan plume s’active… quelques instants.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
