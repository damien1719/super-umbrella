import { FileText, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-dashed border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Commencez par en créer un nouveau bilan
            </h2>
            <Button variant="primary" onClick={onCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Rédiger un nouveau bilan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EmptyState;
