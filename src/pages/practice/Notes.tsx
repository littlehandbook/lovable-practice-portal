
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, Check, Save, Lock, AlertTriangle, Clock } from 'lucide-react';

const NotesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Mock data for notes
  const mockNotes = [
    { id: 1, clientName: 'Jane Doe', sessionDate: '2023-05-20', title: 'Session 1', content: 'Client reported anxiety related to work. Discussed grounding techniques.', status: 'saved' },
    { id: 2, clientName: 'John Smith', sessionDate: '2023-05-19', title: 'Initial Assessment', content: 'Client presented with depression symptoms. Assessed for risk factors.', status: 'saved' },
    { id: 3, clientName: 'Emily Johnson', sessionDate: '2023-05-18', title: 'Follow-up Session', content: 'Continued CBT exercises. Client showing improvement.', status: 'saved' },
    { id: 4, clientName: 'Michael Brown', sessionDate: '2023-05-17', title: 'Crisis Intervention', content: 'Addressed acute anxiety episode. Safety plan reviewed.', status: 'draft' },
    { id: 5, clientName: 'Sarah Williams', sessionDate: '2023-05-20', title: 'Medication Review', content: 'Discussed medication side effects. Client to follow up with psychiatrist.', status: 'saved' },
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
    }
  };

  const handleCreateNewNote = () => {
    setSelectedNote(null);
    setNoteContent('');
  };

  const handleSaveNote = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
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
                      <p className="text-xs text-gray-500 mt-1">
                        {note.sessionDate}
                      </p>
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
                  {selectedNote 
                    ? `Edit Note: ${mockNotes.find(n => n.id === selectedNote)?.title}`
                    : 'Create New Note'
                  }
                </CardTitle>
                <div className="flex items-center text-sm">
                  <Lock className="h-4 w-4 mr-1 text-teal-600" />
                  <span className="text-teal-600 font-medium">Encrypted</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedNote !== null || true ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client">Client</Label>
                      <Input 
                        id="client" 
                        defaultValue={selectedNote ? mockNotes.find(n => n.id === selectedNote)?.clientName : ''}
                        placeholder="Select client" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="session-date">Session Date</Label>
                      <Input 
                        id="session-date" 
                        type="date" 
                        defaultValue={selectedNote ? mockNotes.find(n => n.id === selectedNote)?.sessionDate : new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      defaultValue={selectedNote ? mockNotes.find(n => n.id === selectedNote)?.title : ''}
                      placeholder="Note title" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Note Content</Label>
                    <div className="border rounded-md">
                      {/* This would be a rich text editor in a real app */}
                      <textarea 
                        id="content"
                        className="w-full min-h-[300px] p-3 focus:outline-none"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Enter session notes here..."
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {noteContent ? `${noteContent.length} characters` : '0 characters'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-amber-600">
                      {isSaving ? (
                        <>
                          <Clock className="animate-spin h-4 w-4 mr-1" />
                          <span className="text-sm">Saving...</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Unsaved changes</span>
                        </>
                      )}
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline">
                        Save as Draft
                      </Button>
                      <Button 
                        className="bg-teal-600 hover:bg-teal-700" 
                        onClick={handleSaveNote}
                        disabled={isSaving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Note'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No Note Selected</h3>
                    <p className="text-gray-500 mt-2">
                      Select a note from the list to edit or create a new note.
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
