import { Button } from '@/components/ui/button';

interface EmptyTemplateStateProps {
  onAdd: () => void;
}

export default function EmptyTemplateState({ onAdd }: EmptyTemplateStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-md">
      <p className="mb-4 text-sm text-gray-600">
        Le mode avancé n'est pas activé pour cette partie. Il permet plus de
        personnalisation, mais est plus complexe à utiliser. N'hésitez pas à
        vous rapprocher de nos équipes si vous voulez personnaliser plus le
        format ou la génération support@bilanplume.fr.
      </p>
      <Button type="button" onClick={onAdd}>
        Activer le mode avancé
      </Button>
    </div>
  );
}
