import { Upload } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { DocumentCard, DocumentInfo } from './DocumentCard';
import { Input } from './input';
import { Label } from './label';
import { Table, TableBody, TableHead, TableHeader, TableRow } from './table';

interface Props {
  documents: DocumentInfo[];
  onUpload?: (file: File) => void;
}

export function DocumentList({ documents, onUpload }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Documents
          </span>
          <div className="flex space-x-2">
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button size="sm" asChild>
                <span>Ajouter</span>
              </Button>
            </Label>
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(e) => onUpload?.(e.target.files?.[0] as File)}
            />
          </div>
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
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
