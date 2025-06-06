
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, FileText, Eye, Plus, Save, Edit, X } from 'lucide-react';
import { useNoteTemplates } from '@/hooks/useNoteTemplates';
import { SessionNotesService, Session, SessionNote } from '@/services/SessionNotesService';
import { useToast } from '@/hooks/use-toast';

interface ClientSessionHistoryTabProps {
  clientId: string;
}

export const ClientSessionHistoryTab: React.FC<ClientSessionHistoryTabProps> = ({ 
  clientId
}) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  // New session form data
  const [newSession, setNewSession] = useState({
    session_date: '',
    session_type: 'Individual Therapy',
    duration_minutes: 50,
    status: 'Completed'
  });

  const { enabledTemplates } = useNoteTemplates();
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, [clientId]);

  useEffect(() => {
    if (selectedSession) {
      loadSessionNotes(selectedSession.id);
    }
  }, [selectedSession]);

  const loadSessions = async () => {
    try {
      const { data, error } = await SessionNotesService.getSessions(clientId);
      if (error) {
        console.error('Error loading sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sessions',
          variant: 'destructive'
        });
      } else {
        setSessions(data);
        if (data.length > 0 && !selectedSession) {
          setSelectedSession(data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionNotes = async (sessionId: string) => {
    try {
      const { data, error } = await SessionNotesService.getSessionNotes(clientId);
      if (error) {
        console.error('Error loading session notes:', error);
      } else {
        // Filter notes for this specific session
        const sessionSpecificNotes = data.filter(note => note.session_id === sessionId);
        setSessionNotes(sessionSpecificNotes);
        // Set the first note's content if available
        if (sessionSpecificNotes.length > 0) {
          setNoteContent(sessionSpecificNotes[0].content);
        } else {
          setNoteContent('');
        }
      }
    } catch (error) {
      console.error('Error loading session notes:', error);
    }
  };

  const handleCreateSession = async () => {
    try {
      const { data, error } = await SessionNotesService.createSession({
        client_id: clientId,
        session_date: newSession.session_date,
        session_type: newSession.session_type,
        duration_minutes: newSession.duration_minutes,
        status: newSession.status
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create session',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Session created successfully'
        });
        setIsCreatingSession(false);
        setNewSession({
          session_date: '',
          session_type: 'Individual Therapy',
          duration_minutes: 50,
          status: 'Completed'
        });
        loadSessions();
        if (data) {
          setSelectedSession(data);
        }
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleViewSession = (session: Session) => {
    setSelectedSession(session);
    setIsEditingNote(false);
    setEditingNoteId(null);
  };

  const handleSaveNote = async () => {
    if (!selectedSession) return;

    try {
      if (editingNoteId) {
        // Update existing note
        const { data, error } = await SessionNotesService.updateSessionNote(editingNoteId, {
          content: noteContent,
          template_id: selectedTemplate
        });
        if (error) {
          toast({
            title: 'Error',
            description: 'Failed to update note',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Success',
            description: 'Note updated successfully'
          });
        }
      } else {
        // Create new note
        const { data, error } = await SessionNotesService.createSessionNote({
          session_id: selectedSession.id,
          client_id: clientId,
          template_id: selectedTemplate,
          content: noteContent
        });
        if (error) {
          toast({
            title: 'Error',
            description: 'Failed to create note',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Success',
            description: 'Note created successfully'
          });
        }
      }
      
      setIsEditingNote(false);
      setEditingNoteId(null);
      loadSessionNotes(selectedSession.id);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = enabledTemplates.find(t => t.id === templateId);
    if (template && template.fields) {
      const templateStructure = template.fields.map(field => 
        `${field.label}:\n${field.description ? `(${field.description})` : ''}\n\n`
      ).join('');
      setNoteContent(templateStructure);
    }
  };

  const handleEditNote = (note: SessionNote) => {
    setNoteContent(note.content);
    setSelectedTemplate(note.template_id || '');
    setIsEditingNote(true);
    setEditingNoteId(note.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sessions List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Session History
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setIsCreatingSession(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Session
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isCreatingSession && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-3">Create New Session</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="session_date">Session Date & Time</Label>
                  <Input
                    id="session_date"
                    type="datetime-local"
                    value={newSession.session_date}
                    onChange={(e) => setNewSession(prev => ({ ...prev, session_date: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="session_type">Type</Label>
                    <Select 
                      value={newSession.session_type} 
                      onValueChange={(value) => setNewSession(prev => ({ ...prev, session_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual Therapy">Individual Therapy</SelectItem>
                        <SelectItem value="Group Therapy">Group Therapy</SelectItem>
                        <SelectItem value="CBT Session">CBT Session</SelectItem>
                        <SelectItem value="Assessment">Assessment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newSession.duration_minutes}
                      onChange={(e) => setNewSession(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 50 }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateSession}>
                    <Save className="h-4 w-4 mr-1" />
                    Create
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsCreatingSession(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

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
                        <div className="text-sm font-medium">{formatDate(session.session_date)}</div>
                        <div className="text-xs text-gray-500">{formatTime(session.session_date)}</div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{session.session_type}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {session.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.duration_minutes} min
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                  
                  {session.summary_excerpt && (
                    <div className="text-xs text-gray-600 line-clamp-2 mt-2 p-2 bg-gray-100 rounded">
                      {session.summary_excerpt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sessions recorded yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first session to get started</p>
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
                ? `Session Notes - ${formatDate(selectedSession.session_date)}` 
                : 'Select a Session'
              }
            </span>
            {selectedSession && !isEditingNote && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditingNote(true)}
              >
                {sessionNotes.length > 0 ? 'Edit Notes' : 'Add Notes'}
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
                    <p>{formatDate(selectedSession.session_date)} at {formatTime(selectedSession.session_date)}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Duration</Label>
                    <p>{selectedSession.duration_minutes} minutes</p>
                  </div>
                  <div>
                    <Label className="font-medium">Session Type</Label>
                    <p>{selectedSession.session_type}</p>
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
                        onClick={() => {
                          setIsEditingNote(false);
                          setEditingNoteId(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessionNotes.length > 0 ? (
                      sessionNotes.map((note) => (
                        <div key={note.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-xs text-gray-500">
                              Created: {formatDate(note.created_at)}
                              {note.template_id && ` • Template: ${note.template_id}`}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNote(note)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                        <p className="text-gray-500 text-sm">No notes recorded for this session</p>
                      </div>
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
