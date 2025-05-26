
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';

interface CameraUploadProps {
  onFileSelect: (file: File) => void;
  uploading?: boolean;
  accept?: string;
}

export const CameraUpload: React.FC<CameraUploadProps> = ({ 
  onFileSelect, 
  uploading = false,
  accept = "image/*,application/pdf,.doc,.docx"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset the input
      e.target.value = '';
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        size="sm"
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload File
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => cameraInputRef.current?.click()}
        disabled={uploading}
        size="sm"
      >
        <Camera className="h-4 w-4 mr-2" />
        Take Photo
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
