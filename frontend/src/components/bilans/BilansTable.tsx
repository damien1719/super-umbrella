import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export interface BilanItem {
  id: string;
  date: string;
  patient?: { firstName: string; lastName: string };
  bilanType?: { name: string };
}

interface BilansTableProps {
  bilans: BilanItem[];
  onSelect: (id: string) => void;
  onDelete: (bilan: BilanItem) => void;
  formatDate: (d: string) => string;
}

export function BilansTable({
  bilans,
  onSelect,
  onDelete,
  formatDate,
}: BilansTableProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Historique des bilans
          </h3>
          <span className="text-sm text-gray-500">
            {bilans.length} bilan{bilans.length > 1 ? 's' : ''}
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
                  onClick={() => onSelect(bilan.id)}
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
      </CardContent>
    </Card>
  );
}

export default BilansTable;
