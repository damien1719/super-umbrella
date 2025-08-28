import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export interface BilanTypeInfo {
  id: string;
  name: string;
  description?: string | null;
  authorPrenom?: string | null;
}

interface BilanTypeCardProps {
  bilanType: BilanTypeInfo;
  onOpen?: () => void;
  onDelete?: () => void;
}

export default function BilanTypeCard({
  bilanType,
  onOpen,
  onDelete,
}: BilanTypeCardProps) {
  return (
    <Card
      onClick={onOpen}
      className="relative group hover:shadow-md hover:bg-wood-100 transition-shadow cursor-pointer max-w-60 w-full"
    >
      {onDelete && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Supprimer"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-gray-900">
          {bilanType.name}
        </CardTitle>
        {bilanType.authorPrenom && (
          <p className="text-xs text-gray-500">
            Partagé par {bilanType.authorPrenom}
          </p>
        )}
      </CardHeader>
      {bilanType.description && (
        <CardContent className="space-y-1">
          <p className="text-sm text-gray-600">{bilanType.description}</p>
        </CardContent>
      )}
    </Card>
  );
}
