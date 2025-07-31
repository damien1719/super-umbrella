'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BilanItem {
  id: string;
  date: string;
  patient?: { firstName: string; lastName: string };
  bilanType?: { name: string };
}

interface BilansTableProps {
  bilans: BilanItem[];
  totalCount: number;
  onRowClick: (id: string) => void;
  onDelete: (bilan: BilanItem) => void;
}

export default function BilansTable({
  bilans,
  totalCount,
  onRowClick,
  onDelete,
}: BilansTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Historique des bilans
        </h3>
        <span className="text-sm text-gray-500">
          {totalCount} bilan{totalCount > 1 ? 's' : ''}
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Date</TableHead>
              <TableHead>Nom Patient</TableHead>
              <TableHead>Nom bilan</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {bilans.map((bilan) => (
              <TableRow
                key={bilan.id}
                onClick={() => onRowClick(bilan.id)}
                className="hover:bg-gray-200 cursor-pointer"
              >
                <TableCell className="font-medium">
                  {formatDate(bilan.date)}
                </TableCell>
                <TableCell>
                  {bilan.patient
                    ? `${bilan.patient.firstName} ${bilan.patient.lastName}`
                    : ''}
                </TableCell>
                <TableCell>{bilan.bilanType?.name ?? ''}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-600"
                    aria-label="Supprimer le bilan"
                    onClick={() => onDelete(bilan)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
