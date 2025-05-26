
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Camera, Upload, FileText, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OCRNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; session_date?: string; is_shared_with_practitioner?: boolean }) => Promise<void>;
}

export const OCRNoteDialog: React.FC<OCRNoteDialogProps> = ({
  open,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processImageWithOCR = async (file: File) => {
    setProcessing(true);
    try {
      // Create a simple OCR simulation - in a real app you'd use Tesseract.js or a cloud OCR service
      const reader = new FileReader();
      reader.onload = (e) => {
        // Simulate OCR processing
        setTimeout(() => {
          const extractedText = `[Extracted text from ${file.name}]\n\nThis is where the OCR extracted text would appear. In a real implementation, this would use Tesseract.js or a cloud OCR service like Google Cloud Vision API to extract actual text from the image.`;
          setContent(prev => prev ? `${prev}\n\n${extractedText}` : extractedText);
          if (!title) {
            setTitle(`OCR Note from ${file.name.split('.')[0]}`);
          }
          setProcessing(false);
          toast({
            title: "Success",
            description: "Text extracted from image successfully"
          });
        }, 2000);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setProcessing(false);
      toast({
        title: "Error",
        description: "Failed to process image for OCR",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        processImageWithOCR(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        session_date: sessionDate || undefined,
        is_shared_with_practitioner: isShared
      });
      // Reset form
      setTitle('');
      setContent('');
      setSessionDate('');
      setIsShared(false);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Create Note from Image (OCR)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing || saving}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              disabled={processing || saving}
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {processing && (
            <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
              <Loader className="h-5 w-5 animate-spin mr-2" />
              <span>Processing image and extracting text...</span>
            </div>
          )}

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your journal entry"
              disabled={saving || processing}
            />
          </div>

          <div>
            <Label htmlFor="session-date">Session Date (Optional)</Label>
            <Input
              id="session-date"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              disabled={saving || processing}
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Extracted text will appear here, or you can type your notes..."
              className="min-h-[200px]"
              disabled={saving || processing}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="share-with-practitioner"
              checked={isShared}
              onCheckedChange={(checked) => setIsShared(!!checked)}
              disabled={saving || processing}
            />
            <Label htmlFor="share-with-practitioner">
              Share this entry with my practitioner
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={saving || processing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!title.trim() || !content.trim() || saving || processing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? 'Saving...' : 'Create Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
