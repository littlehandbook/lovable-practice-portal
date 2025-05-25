
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';

interface DragDropUploadProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({ onFileChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Drag & Drop Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => document.getElementById('drag-drop-upload')?.click()}
        >
          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-4" />
          <p className="font-medium text-gray-700 mb-1">Drag and drop files here</p>
          <p className="text-sm text-gray-500 mb-4">or click to select files</p>
          <p className="text-xs text-gray-500">
            Maximum file size: 10MB. Supported formats: PDF, JPG, PNG, DOC, DOCX
          </p>
          <input 
            id="drag-drop-upload" 
            type="file" 
            className="hidden"
            onChange={onFileChange} 
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </div>
      </CardContent>
    </Card>
  );
};
