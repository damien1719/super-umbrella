import { Download, Trash2 } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { TableRow, TableCell } from './table';

export interface DocumentInfo {
  id: string;
  fileName: string;
  type: string;
  fileUrl: string;
  uploadedAt: string;
}

interface Props {
  doc: DocumentInfo;
  onDelete?: (id: string) => void;
}

export function DocumentCard({ doc, onDelete }: Props) {
  return (
    <TableRow key={doc.id}>
      <TableCell>
        <div>
          <p className="font-medium text-sm">{doc.fileName}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{doc.type}</Badge>
      </TableCell>
      <TableCell className="text-sm">{doc.uploadedAt.slice(0, 10)}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" asChild>
            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600"
            onClick={() => onDelete?.(doc.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
