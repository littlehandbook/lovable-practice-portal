
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DocumentRecord } from '@/models';

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
    <div className="rounded-md border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Uploaded
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {doc.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(doc.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatFileSize(doc.file_size)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDownload(doc)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
