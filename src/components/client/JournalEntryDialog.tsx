
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ClientJournalEntry } from '@/services/ClientJournalService';

interface JournalEntryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; session_date?: string; is_shared_with_practitioner?: boolean }) => Promise<void>;
  entry?: ClientJournalEntry | null;
  loading?: boolean;
}

export const JournalEntryDialog: React.FC<JournalEntryDialogProps> = ({
  open,
  onClose,
  onSave,
  entry,
  loading = false
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setSessionDate(entry.session_date || '');
      setIsShared(entry.is_shared_with_practitioner);
    } else {
      setTitle('');
      setContent('');
      setSessionDate('');
      setIsShared(false);
    }
  }, [entry, open]);

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
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {entry ? 'Edit Journal Entry' : 'New Journal Entry'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your journal entry"
              disabled={saving || loading}
            />
          </div>

          <div>
            <Label htmlFor="session-date">Session Date (Optional)</Label>
            <Input
              id="session-date"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              disabled={saving || loading}
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts, experiences, or reflections..."
              className="min-h-[200px]"
              disabled={saving || loading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="share-with-practitioner"
              checked={isShared}
              onCheckedChange={setIsShared}
              disabled={saving || loading}
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
            disabled={saving || loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!title.trim() || !content.trim() || saving || loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? 'Saving...' : (entry ? 'Update Entry' : 'Create Entry')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
