
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, FileText, Eye, Plus, Save } from 'lucide-react';
import { useNoteTemplates } from '@/hooks/useNoteTemplates';

interface ClientSessionHistoryTabProps {
  clientId: string;
}

export const ClientSessionHistoryTab: React.FC<ClientSessionHistoryTabProps> = ({ 
  clientId
}) => {
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const { enabledTemplates } = useNoteTemplates();

  // Mock data for now - will be replaced with actual data loading
  const sessions = [
    {
      id: '1',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: 50,
      type: 'Individual Therapy',
      status: 'Completed',
      therapist: 'Dr. Smith',
      notes: 'Client showed good progress with anxiety management techniques.'
    },
    {
      id: '2',
      date: '2024-01-08',
      time: '2:00 PM',
      duration: 45,
      type: 'CBT Session',
      status: 'Completed',
      therapist: 'Dr. Smith',
      notes: 'Worked on cognitive restructuring exercises.'
    }
  ];

  const handleViewSession = (session: any) => {
    setSelectedSession(session);
    setNoteContent(session.notes || '');
    setIsEditingNote(false);
  };

  const handleSaveNote = () => {
    console.log('Saving note:', { sessionId: selectedSession?.id, template: selectedTemplate, content: noteContent });
    // TODO: Implement note saving logic
    setIsEditingNote(false);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = enabledTemplates.find(t => t.id === templateId);
    if (template && template.fields) {
      // Generate template structure
      const templateStructure = template.fields.map(field => 
        `${field.label}:\n${field.description ? `(${field.description})` : ''}\n\n`
      ).join('');
      setNoteContent(templateStructure);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedSession?.id === session.id ? 'bg-gray-50 border-teal-500' : ''
                  }`}
                  onClick={() => handleViewSession(session)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-medium">{session.date}</div>
                        <div className="text-xs text-gray-500">{session.time}</div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{session.type}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {session.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.duration} min
                          </div>
                          <div>with {session.therapist}</div>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                  
                  {session.notes && (
                    <div className="text-xs text-gray-600 line-clamp-2 mt-2 p-2 bg-gray-100 rounded">
                      {session.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sessions recorded yet</p>
              <p className="text-sm text-gray-400 mt-1">Session history will appear here once sessions are scheduled or completed</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Details and Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {selectedSession 
                ? `Session Notes - ${selectedSession.date}` 
                : 'Select a Session'
              }
            </span>
            {selectedSession && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditingNote(!isEditingNote)}
              >
                {isEditingNote ? 'Cancel' : 'Edit Notes'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSession ? (
            <div className="space-y-4">
              {/* Session Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Date & Time</Label>
                    <p>{selectedSession.date} at {selectedSession.time}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Duration</Label>
                    <p>{selectedSession.duration} minutes</p>
                  </div>
                  <div>
                    <Label className="font-medium">Session Type</Label>
                    <p>{selectedSession.type}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Status</Label>
                    <p>{selectedSession.status}</p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Session Notes</Label>
                
                {isEditingNote && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="template">Note Template</Label>
                      <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Template</SelectItem>
                          {enabledTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {isEditingNote ? (
                  <div className="space-y-3">
                    <Textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Enter session notes..."
                      className="min-h-[200px]"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveNote} size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Save Notes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditingNote(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                    {noteContent ? (
                      <p className="text-sm whitespace-pre-wrap">{noteContent}</p>
                    ) : (
                      <p className="text-gray-500 text-sm">No notes recorded for this session</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500">No Session Selected</h3>
              <p className="text-gray-400 mt-2 text-center">
                Select a session from the list to view details and notes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
