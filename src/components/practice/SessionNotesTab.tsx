import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Plus, Save, Bot, BookOpen, AlertTriangle } from 'lucide-react';
import { NoteEditor } from './NoteEditor';

// Mock data for existing session notes
const mockSessionNotes = [
  {
    id: '1',
    clientId: 'client-1',
    sessionDate: '2024-01-15',
    template: 'soap',
    content: {
      subjective: 'Client reported feeling anxious about work presentation.',
      objective: 'Client appeared fidgety, spoke rapidly.',
      assessment: 'Anxiety symptoms present, coping strategies needed.',
      plan: 'Continue CBT techniques, relaxation exercises.'
    },
    homework: 'Practice deep breathing exercises daily for 10 minutes',
    freudRiskRating: 'Low',
    practitionerRiskRating: 'Medium',
    aiAssessment: 'Client shows signs of generalized anxiety with work-related triggers.',
    aiEvaluation: 'Progress noted in self-awareness. Recommend continued focus on coping strategies.',
    aiNextSession: 'Focus on workplace anxiety management and assertiveness training.',
    aiHomework: 'Implement daily mindfulness practice and anxiety journal.',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    clientId: 'client-1',
    sessionDate: '2024-01-08',
    template: 'birp',
    content: {
      behavior: 'Client demonstrated good engagement in session.',
      intervention: 'Cognitive restructuring techniques introduced.',
      response: 'Positive response to CBT interventions.',
      plan: 'Continue with weekly sessions.'
    },
    homework: 'Complete thought record worksheet',
    freudRiskRating: 'Low',
    practitionerRiskRating: 'Low',
    aiAssessment: 'Stable presentation with good therapeutic engagement.',
    aiEvaluation: 'Client responding well to CBT approach.',
    aiNextSession: 'Build on cognitive restructuring success.',
    aiHomework: 'Introduce behavioral activation techniques.',
    createdAt: '2024-01-08T14:00:00Z'
  }
];

// Template definitions
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
  }
];

interface SessionNotesTabProps {
  clientId: string;
}

export const SessionNotesTab: React.FC<SessionNotesTabProps> = ({ clientId }) => {
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingHomework, setEditingHomework] = useState(false);
  const [homework, setHomework] = useState('');
  const [practitionerRiskRating, setPractitionerRiskRating] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Sort notes by date (most recent first)
  const sortedNotes = [...mockSessionNotes].sort((a, b) => 
    new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
  );

  const handleSelectNote = (note: any) => {
    setSelectedNote(note);
    setHomework(note.homework || '');
    setPractitionerRiskRating(note.practitionerRiskRating || '');
    setShowEditor(false);
    setEditingHomework(false);
  };

  const handleCreateNewNote = () => {
    setSelectedNote(null);
    setHomework('');
    setPractitionerRiskRating('');
    setShowEditor(true);
    setEditingHomework(false);
  };

  const handleEditNote = () => {
    setShowEditor(true);
  };

  const handleSaveNote = (noteData: { template: string; content: Record<string, string> }) => {
    console.log('Saving note:', noteData);
    // In real implementation, this would save to the database
    setShowEditor(false);
  };

  const handleSaveHomework = () => {
    console.log('Saving homework:', homework);
    // In real implementation, this would update the database
    setEditingHomework(false);
  };

  const handleSaveRiskRating = () => {
    console.log('Saving risk rating:', practitionerRiskRating);
    // In real implementation, this would update the database
  };

  const handleGenerateAI = async (type: 'assessment' | 'evaluation' | 'nextSession' | 'homework') => {
    setIsGeneratingAI(true);
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Generating AI ${type} for client ${clientId}`);
      // In real implementation, this would call an AI service
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRiskRatingColor = (rating: string) => {
    switch (rating?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Session Notes List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Session Notes
            </CardTitle>
            <Button 
              size="sm" 
              onClick={handleCreateNewNote}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {sortedNotes.length > 0 ? (
              sortedNotes.map((note) => (
                <div 
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedNote?.id === note.id ? 'bg-gray-50 border-teal-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm font-medium">{formatDate(note.sessionDate)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {note.template.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2">
                    {Object.values(note.content)[0] as string}
                  </div>
                  <div className="flex items-center mt-2 space-x-2">
                    <Badge className={`text-xs ${getRiskRatingColor(note.freudRiskRating)}`}>
                      AI: {note.freudRiskRating}
                    </Badge>
                    <Badge className={`text-xs ${getRiskRatingColor(note.practitionerRiskRating)}`}>
                      Practitioner: {note.practitionerRiskRating}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>No session notes yet.</p>
                <p className="text-sm mt-1">Create your first session note.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Note Details and Editor */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {showEditor 
                ? (selectedNote ? 'Edit Session Note' : 'New Session Note')
                : (selectedNote ? `Session Note - ${formatDate(selectedNote.sessionDate)}` : 'Select a Note')
              }
            </CardTitle>
            {selectedNote && !showEditor && (
              <Button variant="outline" size="sm" onClick={handleEditNote}>
                Edit Note
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showEditor ? (
            <NoteEditor
              onSave={handleSaveNote}
              onCancel={() => setShowEditor(false)}
              availableTemplates={defaultTemplates}
              initialData={selectedNote ? {
                template: selectedNote.template,
                content: selectedNote.content
              } : undefined}
            />
          ) : selectedNote ? (
            <div className="space-y-6">
              {/* Session Note Content */}
              <div>
                <h3 className="font-medium mb-3">Session Notes</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  {Object.entries(selectedNote.content).map(([key, value]) => (
                    <div key={key} className="mb-3 last:mb-0">
                      <Label className="text-sm font-medium capitalize">{key}:</Label>
                      <p className="text-sm text-gray-700 mt-1">{value as string}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Homework Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Homework
                  </h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingHomework(!editingHomework)}
                  >
                    {editingHomework ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
                {editingHomework ? (
                  <div className="space-y-2">
                    <Textarea
                      value={homework}
                      onChange={(e) => setHomework(e.target.value)}
                      placeholder="Enter homework assignments..."
                      className="min-h-[100px]"
                    />
                    <Button size="sm" onClick={handleSaveHomework}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm text-gray-700">{homework || 'No homework assigned'}</p>
                  </div>
                )}
              </div>

              {/* Risk Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Freud Risk Rating (Read Only)
                  </Label>
                  <div className={`px-3 py-2 rounded-md text-sm ${getRiskRatingColor(selectedNote.freudRiskRating)}`}>
                    {selectedNote.freudRiskRating}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2">Practitioner Risk Rating</Label>
                  <Select value={practitionerRiskRating} onValueChange={(value) => {
                    setPractitionerRiskRating(value);
                    handleSaveRiskRating();
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* AI Sections */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium flex items-center">
                      <Bot className="h-4 w-4 mr-1" />
                      Freud Assessment
                    </Label>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateAI('assessment')}
                      disabled={isGeneratingAI}
                    >
                      <Bot className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <p className="text-sm text-gray-700">{selectedNote.aiAssessment}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium flex items-center">
                      <Bot className="h-4 w-4 mr-1" />
                      Evaluation
                    </Label>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateAI('evaluation')}
                      disabled={isGeneratingAI}
                    >
                      <Bot className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <p className="text-sm text-gray-700">{selectedNote.aiEvaluation}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium flex items-center">
                      <Bot className="h-4 w-4 mr-1" />
                      Next Session Recommendations
                    </Label>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateAI('nextSession')}
                      disabled={isGeneratingAI}
                    >
                      <Bot className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <p className="text-sm text-gray-700">{selectedNote.aiNextSession}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium flex items-center">
                      <Bot className="h-4 w-4 mr-1" />
                      AI Homework Suggestions
                    </Label>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateAI('homework')}
                      disabled={isGeneratingAI}
                    >
                      <Bot className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <p className="text-sm text-gray-700">{selectedNote.aiHomework}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500">No Note Selected</h3>
              <p className="text-gray-400 mt-2 text-center">
                Select a session note from the list to view details or create a new note.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
