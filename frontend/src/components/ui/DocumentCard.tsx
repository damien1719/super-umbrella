import { Download, Trash2 } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { TableRow, TableCell } from './table';

export interface DocumentInfo {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
}

interface Props {
  doc: DocumentInfo;
}

export function DocumentCard({ doc }: Props) {
  return (
    <TableRow key={doc.id}>
      <TableCell>
        <div>
          <p className="font-medium text-sm">{doc.name}</p>
          <p className="text-xs text-gray-500">{doc.size}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{doc.type}</Badge>
      </TableCell>
      <TableCell className="text-sm">{doc.date}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost">
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
