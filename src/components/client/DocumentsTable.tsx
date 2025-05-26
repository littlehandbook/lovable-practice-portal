
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DocumentRecord } from '@/models';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DocumentsTableProps {
  documents: DocumentRecord[];
  formatFileSize: (bytes?: number) => string;
  onDownload: (document: DocumentRecord) => void;
}

export const DocumentsTable: React.FC<DocumentsTableProps> = ({ 
  documents, 
  formatFileSize, 
  onDownload 
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">
                {doc.name}
              </TableCell>
              <TableCell>
                {new Date(doc.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {formatFileSize(doc.file_size)}
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDownload(doc)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
