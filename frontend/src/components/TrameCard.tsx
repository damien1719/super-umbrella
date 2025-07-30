import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pen, Trash2, Check } from 'lucide-react';

export interface TrameInfo {
  id: string;
  title: string;
  description?: string | null;
}

interface TrameCardProps {
  trame: TrameInfo;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TrameCard({
  trame,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: TrameCardProps) {
  return (
    <Card
      onClick={onSelect}
      className={`relative hover:shadow-md transition-shadow cursor-pointer ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
    >
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          {onEdit && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pen className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-gray-900 flex items-center gap-1">
          {selected && <Check className="h-4 w-4 text-blue-600" />}
          {trame.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{trame.description}</p>
      </CardContent>
    </Card>
  );
}