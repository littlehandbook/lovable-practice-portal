import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, Check, Save, Lock, AlertTriangle, Clock } from 'lucide-react';
import { NoteEditor } from '@/components/practice/NoteEditor';

// Template definitions that match the ones in NoteTemplateSettings
const defaultTemplates = [
  {
    id: 'free',
    label: 'Free Field',
    value: 'free',
    fields: [{ key: 'content', label: 'Session Notes' }],
    isEnabled: true,
    isCustom: false,
  },
  {
    id: 'soap',
    label: 'SOAP Notes',
    value: 'soap',
    fields: [
      { key: 'subjective', label: 'Subjective', description: 'Client\'s perspective, feelings, and reported experiences' },
      { key: 'objective', label: 'Objective', description: 'Observable behaviors, appearance, and factual data' },
      { key: 'assessment', label: 'Assessment', description: 'Clinical interpretation and progress analysis' },
      { key: 'plan', label: 'Plan', description: 'Future treatment course and next steps' },
    ],
    isEnabled: true,
    isCustom: false,
  },
  {
    id: 'birp',
    label: 'BIRP Notes',
    value: 'birp',
    fields: [
      { key: 'behavior', label: 'Behavior', description: 'Observable and reported behaviors' },
      { key: 'intervention', label: 'Intervention', description: 'Therapeutic interventions used' },
      { key: 'response', label: 'Response', description: 'Client\'s response to interventions' },
      { key: 'plan', label: 'Plan', description: 'Future session plans and strategies' },
    ],
    isEnabled: true,
    isCustom: false,
  },
  {
    id: 'dap',
    label: 'DAP Notes',
    value: 'dap',
    fields: [
      { key: 'data', label: 'Data', description: 'Combined subjective and objective information' },
      { key: 'assessment', label: 'Assessment', description: 'Clinical assessment of the data' },
      { key: 'plan', label: 'Plan', description: 'Future treatment plan' },
    ],
    isEnabled: true,
    isCustom: false,
  },
  {
    id: 'pirp',
    label: 'PIRP Notes',
    value: 'pirp',
    fields: [
      { key: 'problem', label: 'Problem', description: 'Specific problems addressed in session' },
      { key: 'intervention', label: 'Intervention', description: 'Interventions used for problems' },
      { key: 'response', label: 'Response', description: 'Client\'s response to interventions' },
      { key: 'plan', label: 'Plan', description: 'Future plan for addressing problems' },
    ],
    isEnabled: true,
    isCustom: false,
  },
  {
    id: 'girp',
    label: 'GIRP Notes',
    value: 'girp',
    fields: [
      { key: 'goal', label: 'Goal', description: 'Client\'s treatment goals addressed' },
      { key: 'intervention', label: 'Intervention', description: 'Interventions aimed at goals' },
      { key: 'response', label: 'Response', description: 'Client\'s response in relation to goals' },
      { key: 'plan', label: 'Plan', description: 'Continued work on goals' },
    ],
    isEnabled: true,
    isCustom: false,
  },
];

const NotesPage = () => {
  // In a real app, this would come from the template settings
  const [availableTemplates] = useState(defaultTemplates);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  
  // Mock data for notes with template information
  const mockNotes = [
    { 
      id: 1, 
      clientName: 'Jane Doe', 
      sessionDate: '2023-05-20', 
      title: 'Session 1', 
      content: 'Client reported anxiety related to work. Discussed grounding techniques.',
      template: 'free',
      status: 'saved' 
    },
    { 
      id: 2, 
      clientName: 'John Smith', 
      sessionDate: '2023-05-19', 
      title: 'Initial Assessment', 
      content: 'Client presented with depression symptoms. Assessed for risk factors.',
      template: 'soap',
      status: 'saved' 
    },
    { 
      id: 3, 
      clientName: 'Emily Johnson', 
      sessionDate: '2023-05-18', 
      title: 'Follow-up Session', 
      content: 'Continued CBT exercises. Client showing improvement.',
      template: 'birp',
      status: 'saved' 
    },
    { 
      id: 4, 
      clientName: 'Michael Brown', 
      sessionDate: '2023-05-17', 
      title: 'Crisis Intervention', 
      content: 'Addressed acute anxiety episode. Safety plan reviewed.',
      template: 'dap',
      status: 'draft' 
    },
    { 
      id: 5, 
      clientName: 'Sarah Williams', 
      sessionDate: '2023-05-20', 
      title: 'Medication Review', 
      content: 'Discussed medication side effects. Client to follow up with psychiatrist.',
      template: 'free',
      status: 'saved' 
    },
  ];

  const filteredNotes = mockNotes.filter(note =>
    note.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectNote = (id: number) => {
    const selectedNote = mockNotes.find(note => note.id === id);
    if (selectedNote) {
      setSelectedNote(id);
      setNoteContent(selectedNote.content);
      setShowEditor(false);
    }
  };

  const handleCreateNewNote = () => {
    setSelectedNote(null);
    setNoteContent('');
    setShowEditor(true);
  };

  const handleEditNote = () => {
    setShowEditor(true);
  };

  const handleSaveNote = (noteData: { template: string; content: Record<string, string> }) => {
    setIsSaving(true);
    console.log('Saving note with template:', noteData.template);
    console.log('Note content:', noteData.content);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowEditor(false);
      // In real implementation, this would update the note in the list
    }, 1000);
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Session Notes</h1>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleCreateNewNote}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 h-auto">
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <CardTitle>Notes List</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search notes..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note) => (
                    <div 
                      key={note.id}
                      onClick={() => handleSelectNote(note.id)}
                      className={`border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedNote === note.id ? 'bg-gray-50 border-teal-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm">{note.title}</h3>
                          <p className="text-xs text-gray-500">{note.clientName}</p>
                        </div>
                        {note.status === 'draft' && (
                          <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                            Draft
                          </span>
                        )}
                        {note.status === 'saved' && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Saved
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {note.content}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          {note.sessionDate}
                        </p>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {note.template.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No notes found matching your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {showEditor 
                    ? (selectedNote 
                        ? `Edit Note: ${mockNotes.find(n => n.id === selectedNote)?.title}`
                        : 'Create New Note'
                      )
                    : selectedNote 
                      ? `View Note: ${mockNotes.find(n => n.id === selectedNote)?.title}`
                      : 'Select a Note'
                  }
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {selectedNote && !showEditor && (
                    <Button variant="outline" size="sm" onClick={handleEditNote}>
                      Edit Note
                    </Button>
                  )}
                  <div className="flex items-center text-sm">
                    <Lock className="h-4 w-4 mr-1 text-teal-600" />
                    <span className="text-teal-600 font-medium">Encrypted</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showEditor ? (
                <NoteEditor
                  onSave={handleSaveNote}
                  onCancel={handleCancelEdit}
                  availableTemplates={availableTemplates}
                  initialData={selectedNote ? {
                    template: mockNotes.find(n => n.id === selectedNote)?.template || 'free',
                    content: { content: mockNotes.find(n => n.id === selectedNote)?.content || '' }
                  } : undefined}
                />
              ) : selectedNote ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client">Client</Label>
                      <Input 
                        id="client" 
                        value={mockNotes.find(n => n.id === selectedNote)?.clientName || ''}
                        readOnly
                        className="bg-gray-50" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="session-date">Session Date</Label>
                      <Input 
                        id="session-date" 
                        value={mockNotes.find(n => n.id === selectedNote)?.sessionDate || ''}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      value={mockNotes.find(n => n.id === selectedNote)?.title || ''}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template">Template Used</Label>
                    <Input 
                      id="template" 
                      value={mockNotes.find(n => n.id === selectedNote)?.template?.toUpperCase() || 'FREE'}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Note Content</Label>
                    <div className="border rounded-md bg-gray-50">
                      <textarea 
                        id="content"
                        className="w-full min-h-[300px] p-3 bg-gray-50 focus:outline-none"
                        value={noteContent}
                        readOnly
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {noteContent ? `${noteContent.length} characters` : '0 characters'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No Note Selected</h3>
                    <p className="text-gray-500 mt-2">
                      Select a note from the list to view or create a new note with templates.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotesPage;
