
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Check } from 'lucide-react';
import { DocumentRecord } from '@/models';

interface SessionNotesTabProps {
  sessionNotes: DocumentRecord[];
  onDownload: (document: DocumentRecord) => void;
}

export const SessionNotesTab: React.FC<SessionNotesTabProps> = ({ sessionNotes, onDownload }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Session Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {sessionNotes.length > 0 ? (
          <div className="space-y-4">
            {sessionNotes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-purple-600 mr-2" />
                        <p className="font-medium">{note.name}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Shared on {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center mr-2">
                        <Check className="h-3 w-3 mr-1" />
                        Shared
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDownload(note)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No session notes have been shared with you yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
