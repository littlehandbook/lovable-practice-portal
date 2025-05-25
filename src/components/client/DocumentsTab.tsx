
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentRecord } from '@/models';
import { DocumentsTable } from './DocumentsTable';
import { EmptyDocumentsState } from './EmptyDocumentsState';
import { DragDropUpload } from './DragDropUpload';

interface DocumentsTabProps {
  documents: DocumentRecord[];
  formatFileSize: (bytes?: number) => string;
  onDownload: (document: DocumentRecord) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ 
  documents, 
  formatFileSize, 
  onDownload, 
  onFileChange 
}) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <DocumentsTable 
              documents={documents} 
              formatFileSize={formatFileSize} 
              onDownload={onDownload} 
            />
          ) : (
            <EmptyDocumentsState onFileChange={onFileChange} />
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <DragDropUpload onFileChange={onFileChange} />
      </div>
    </>
  );
};
