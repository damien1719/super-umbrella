import { Button } from '@/components/ui/button';

interface EmptyTemplateStateProps {
  onAdd: () => void;
}

export default function EmptyTemplateState({ onAdd }: EmptyTemplateStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-md">
      <p className="mb-4 text-sm text-gray-600">
        Aucun template n&apos;est associé à cette section.
      </p>
      <Button type="button" onClick={onAdd}>
        Ajouter un template
      </Button>
    </div>
  );
}
