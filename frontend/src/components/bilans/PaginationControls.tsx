'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalCount,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const go = (page: number) => {
    onPageChange(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-500">
        Affichage de {startIndex + 1} à {Math.min(endIndex, totalCount)} sur{' '}
        {totalCount} bilans
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => go(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => go(page)}
              className="w-8 h-8 p-0"
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => go(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Suivant
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
