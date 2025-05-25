
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface EmptyDocumentsStateProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmptyDocumentsState: React.FC<EmptyDocumentsStateProps> = ({ onFileChange }) => {
  return (
    <div className="text-center py-8">
      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
      <p className="text-gray-500 mb-4">You haven't uploaded any documents yet</p>
      <label htmlFor="file-upload-empty">
        <Button className="bg-purple-600 hover:bg-purple-700" asChild>
          <span>Upload Document</span>
        </Button>
        <input 
          id="file-upload-empty" 
          type="file" 
          className="hidden" 
          onChange={onFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
      </label>
    </div>
  );
};
