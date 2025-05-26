
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentRecord } from '@/models';
import { DocumentsTable } from './DocumentsTable';
import { EmptyDocumentsState } from './EmptyDocumentsState';
import { CameraUpload } from './CameraUpload';

interface DocumentsTabProps {
  documents: DocumentRecord[];
  formatFileSize: (bytes?: number) => string;
  onDownload: (document: DocumentRecord) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileSelect: (file: File) => void;
  uploading?: boolean;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ 
  documents, 
  formatFileSize, 
  onDownload, 
  onFileChange,
  onFileSelect,
  uploading = false
}) => {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Uploaded Documents</CardTitle>
            <CameraUpload 
              onFileSelect={onFileSelect}
              uploading={uploading}
            />
          </div>
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
    </>
  );
};
