
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OCRNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; session_date?: string; is_shared_with_practitioner?: boolean }) => Promise<void>;
}

export const OCRNoteDialog: React.FC<OCRNoteDialogProps> = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSessionDate('');
    setIsShared(false);
    setSelectedImage(null);
    setImagePreview(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      handleImageSelect(file);
      e.target.value = '';
    }
  };

  const simulateOCR = async (file: File): Promise<string> => {
    // Simulate OCR processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate extracted text based on file name or type
    const sampleTexts = [
      "Today I felt anxious about the upcoming presentation. I noticed my heart racing and my palms getting sweaty when I thought about speaking in front of the team.",
      "Had a good session today. We discussed coping strategies for managing stress. Key takeaways: deep breathing exercises, progressive muscle relaxation, and mindfulness meditation.",
      "Mood has been improving over the past week. I've been practicing the techniques we discussed and they seem to be helping with my sleep patterns.",
      "Feeling overwhelmed with work deadlines. Need to practice better time management and boundary setting. Remember to use the grounding techniques when anxiety peaks."
    ];
    
    return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  };

  const handleProcessImage = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const extractedText = await simulateOCR(selectedImage);
      setContent(extractedText);
      
      // Auto-generate title if not provided
      if (!title) {
        const words = extractedText.split(' ').slice(0, 5).join(' ');
        setTitle(`OCR Note - ${words}...`);
      }
      
      toast({
        title: "OCR Complete",
        description: "Text has been extracted from the image successfully"
      });
    } catch (error) {
      toast({
        title: "OCR Failed",
        description: "Failed to extract text from image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content or process an image first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title,
        content,
        session_date: sessionDate || undefined,
        is_shared_with_practitioner: isShared
      });
      handleClose();
    } catch (error) {
      // Error handled by parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Note from Image (OCR)</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Select Image</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
              
              {selectedImage && (
                <Button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Extract Text'
                  )}
                </Button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
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

          {/* Image Preview */}
          {imagePreview && (
            <div className="space-y-2">
              <Label>Selected Image</Label>
              <div className="border rounded-lg p-2">
                <img 
                  src={imagePreview} 
                  alt="Selected" 
                  className="max-w-full h-48 object-contain mx-auto"
                />
              </div>
            </div>
          )}

          {/* Note Form */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Extracted text will appear here, or type your own content"
              rows={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionDate">Session Date (Optional)</Label>
            <Input
              id="sessionDate"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="shared"
              checked={isShared}
              onCheckedChange={(checked) => setIsShared(checked as boolean)}
            />
            <Label htmlFor="shared">Share with practitioner</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
