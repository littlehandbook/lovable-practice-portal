
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface UploadSectionProps {
  uploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ uploading, onFileChange }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Documents & Notes</h1>
      <label htmlFor="file-upload">
        <Button className="bg-purple-600 hover:bg-purple-700" asChild disabled={uploading}>
          <span>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </span>
        </Button>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          onChange={onFileChange}
          disabled={uploading}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
      </label>
    </div>
  );
};
