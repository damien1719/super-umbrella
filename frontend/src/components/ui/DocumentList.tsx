import { Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { DocumentCard, DocumentInfo } from './DocumentCard';
import { DocumentUploadDialog } from '../DocumentUploadDialog';
import { Table, TableBody, TableHead, TableHeader, TableRow } from './table';

interface Props {
  documents: DocumentInfo[];
  onUpload?: (file: File, type: string) => void;
  onDelete?: (id: string) => void;
}

export function DocumentList({ documents, onUpload, onDelete }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Documents
          </span>
          <DocumentUploadDialog
            onUpload={(file, type) => onUpload?.(file, type)}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onDelete={onDelete} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
