
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface UploadProgressProps {
  uploading: boolean;
  uploadProgress: number;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ uploading, uploadProgress }) => {
  if (!uploading) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Uploading document...</p>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-purple-600 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }} 
            />
          </div>
          <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
        </div>
      </CardContent>
    </Card>
  );
};
