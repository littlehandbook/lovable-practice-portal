import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Calendar, Share2, Edit, Trash2, FileText } from 'lucide-react';
import { ClientJournalEntry } from '@/services/ClientJournalService';
import { JournalEntryDialog } from './JournalEntryDialog';
import { OCRNoteDialog } from './OCRNoteDialog';

interface JournalTabProps {
  journalEntries: ClientJournalEntry[];
  onCreateEntry: (entry: { title: string; content: string; session_date?: string; is_shared_with_practitioner?: boolean }) => Promise<void>;
  onUpdateEntry: (entry: { id: string; title?: string; content?: string; session_date?: string; is_shared_with_practitioner?: boolean }) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  loading?: boolean;
}

export const JournalTab: React.FC<JournalTabProps> = ({ 
  journalEntries, 
  onCreateEntry, 
  onUpdateEntry, 
  onDeleteEntry,
  loading = false 
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [showOCRDialog, setShowOCRDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ClientJournalEntry | null>(null);

  const handleCreate = async (data: { title: string; content: string; session_date?: string; is_shared_with_practitioner?: boolean }) => {
    await onCreateEntry(data);
    setShowDialog(false);
  };

  const handleOCRCreate = async (data: { title: string; content: string; session_date?: string; is_shared_with_practitioner?: boolean }) => {
    await onCreateEntry(data);
    setShowOCRDialog(false);
  };

  const handleEdit = async (data: { title: string; content: string; session_date?: string; is_shared_with_practitioner?: boolean }) => {
    if (editingEntry) {
      await onUpdateEntry({ id: editingEntry.id, ...data });
      setEditingEntry(null);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      await onDeleteEntry(entryId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              My Journal
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowOCRDialog(true)}
                variant="outline"
                disabled={loading}
              >
                <FileText className="h-4 w-4 mr-2" />
                OCR Note
              </Button>
              <Button 
                onClick={() => setShowDialog(true)}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {journalEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No journal entries yet.</p>
              <p className="text-sm mt-1">Start writing about your thoughts and experiences, or create notes from images using OCR.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {journalEntries.map((entry) => (
                <Card key={entry.id} className="border-l-4 border-l-purple-600">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{entry.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          {entry.session_date && (
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Session: {formatDate(entry.session_date)}
                            </span>
                          )}
                          <span>Created: {formatDate(entry.created_at)}</span>
                          {entry.is_shared_with_practitioner && (
                            <span className="flex items-center text-green-600">
                              <Share2 className="h-3 w-3 mr-1" />
                              Shared
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingEntry(entry)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {entry.content.length > 200 
                        ? `${entry.content.substring(0, 200)}...` 
                        : entry.content
                      }
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <JournalEntryDialog
        open={showDialog || !!editingEntry}
        onClose={() => {
          setShowDialog(false);
          setEditingEntry(null);
        }}
        onSave={editingEntry ? handleEdit : handleCreate}
        entry={editingEntry}
        loading={loading}
      />

      <OCRNoteDialog
        open={showOCRDialog}
        onClose={() => setShowOCRDialog(false)}
        onSave={handleOCRCreate}
      />
    </>
  );
};
