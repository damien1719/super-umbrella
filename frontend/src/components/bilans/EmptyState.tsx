import { FileText, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreate?: () => void;
  title?: string;
  description?: string;
  ctaLabel?: string;
  cta?: React.ReactNode;
}

export function EmptyState({
  onCreate,
  title = 'Commencez par créer un nouveau bilan',
  description,
  ctaLabel = 'Rédiger un nouveau bilan',
  cta,
}: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-dashed border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {title}
            </h2>
            {description && (
              <p className="text-gray-600 mb-4 max-w-prose">{description}</p>
            )}
            {cta ? (
              <div>{cta}</div>
            ) : (
              <Button variant="primary" onClick={onCreate}>
                <Plus className="w-4 h-4 mr-2" />
                {ctaLabel}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EmptyState;
