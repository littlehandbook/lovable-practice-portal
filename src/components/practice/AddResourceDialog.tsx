
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClientResourceService } from '@/services/ClientResourceService';

interface AddResourceDialogProps {
  clientId: string;
  onResourceAdded: () => void;
}

export const AddResourceDialog = ({ clientId, onResourceAdded }: AddResourceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [resourceType, setResourceType] = useState<'url' | 'document'>('url');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }

    if (resourceType === 'url' && !url.trim()) {
      toast({
        title: "Error",
        description: "URL is required for URL resources",
        variant: "destructive"
      });
      return;
    }

    if (resourceType === 'document' && !file) {
      toast({
        title: "Error",
        description: "File is required for document resources",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await ClientResourceService.createResource({
        client_id: clientId,
        resource_type: resourceType,
        title: title.trim(),
        description: description.trim() || undefined,
        url: resourceType === 'url' ? url.trim() : undefined,
        file: resourceType === 'document' ? file : undefined
      });

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Resource added successfully"
      });

      // Reset form
      setTitle('');
      setDescription('');
      setUrl('');
      setFile(null);
      setOpen(false);
      onResourceAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive"
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Resource</DialogTitle>
          <DialogDescription>
            Share a URL or document with this client to aid their education.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="resource-type">Resource Type</Label>
            <Select value={resourceType} onValueChange={(value: 'url' | 'document') => setResourceType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">URL Link</SelectItem>
                <SelectItem value="document">Document Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter resource title"
              required
            />
          </div>

          {resourceType === 'url' && (
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
          )}

          {resourceType === 'document' && (
            <div>
              <Label htmlFor="file">Document</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {file ? file.name : 'Click to upload document'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB)
                  </p>
                </label>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this resource"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Resource'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
