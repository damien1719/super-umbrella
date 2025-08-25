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
import type { Patient } from '../../store/patients';

export interface BilanItem {
  id: string;
  title: string;
  date: string;
  patient?: { firstName: string; lastName: string };
}

export type GenericItem = BilanItem | Patient;

interface GenericTableProps {
  variant: 'bilan' | 'patient';
  items: GenericItem[];
  onSelect: (id: string) => void;
  onDelete: (item: GenericItem) => void;
  formatDate?: (d: string) => string;
}

export function GenericTable({
  variant,
  items,
  onSelect,
  onDelete,
  formatDate,
}: GenericTableProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {variant === 'bilan'
              ? 'Historique des bilans'
              : 'Liste des patients'}
          </h3>
          <span className="text-sm text-gray-500">
            {items.length} {variant === 'bilan' ? 'bilan' : 'patient'}
            {items.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {variant === 'bilan' ? (
                  <>
                    <TableHead className="w-32">Date</TableHead>
                    <TableHead>Titre du bilan</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="w-10" />
                  </>
                ) : (
                  <>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead className="w-10" />
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) =>
                variant === 'bilan' ? (
                  <TableRow
                    key={(item as BilanItem).id}
                    onClick={() => onSelect((item as BilanItem).id)}
                    className="hover:bg-gray-200 cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {formatDate ? formatDate((item as BilanItem).date) : ''}
                    </TableCell>
                    <TableCell>{(item as BilanItem).title}</TableCell>
                    <TableCell>
                      {(item as BilanItem).patient
                        ? `${(item as BilanItem).patient!.firstName} ${(item as BilanItem).patient!.lastName}`
                        : ''}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600"
                        aria-label="Supprimer le bilan"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow
                    key={(item as Patient).id}
                    onClick={() => onSelect((item as Patient).id)}
                    className="hover:bg-gray-200 cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {(item as Patient).lastName}
                    </TableCell>
                    <TableCell>{(item as Patient).firstName}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600"
                        aria-label="Supprimer le patient"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default GenericTable;
