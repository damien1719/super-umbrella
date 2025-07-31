'use client';

import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmptyStateProps {
  onNewPatient: () => void;
  onExistingPatient: () => void;
}

export default function EmptyState({
  onNewPatient,
  onExistingPatient,
}: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-dashed border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Aucun bilan disponible
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Il semble que vous n&rsquo;ayez pas encore rédigé de bilan.
              Commencez par en créer un nouveau.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Rédiger un nouveau bilan
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={onNewPatient}>
                  Nouveau patient
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExistingPatient}>
                  Patient existant
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
