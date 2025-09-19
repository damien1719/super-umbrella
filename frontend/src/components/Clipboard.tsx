import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClipboardStore } from '@/store/clipboard';

// Petite carte flottante qui apparaît quand une question est copiée
export default function Clipboard() {
  const item = useClipboardStore((s) => s.item);
  const [dismissed, setDismissed] = useState(false);

  // Si un nouvel élément est copié, ré-afficher la carte
  useEffect(() => {
    if (item) setDismissed(false);
  }, [item]);

  const visible = useMemo(() => Boolean(item) && !dismissed, [item, dismissed]);
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-[360px] p-0 shadow-lg">
        <CardHeader className="py-3 pr-2 pl-4 flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base">
              Presse-papiers
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                aria-label="Fermer l'alerte"
              >
                ✕
              </Button>
            </CardTitle>

            <CardDescription>
              Vous avez copié le contenu d'une question.
              <br />
              Pour le coller, allez une de vos parties de la Bibliothèque en
              mode "Edition" puis cliquer sur "Coller une réutilisation"
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="" />
      </Card>
    </div>
  );
}
