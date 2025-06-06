
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  FileText, 
  Clock, 
  User, 
  Plus,
  Eye,
  Edit2,
  CheckSquare,
  BookOpen
} from 'lucide-react';
import { SessionNotesService, Session, SessionNote, Homework } from '@/services/SessionNotesService';
import { useToast } from '@/hooks/use-toast';
import { SessionNotesTab } from './SessionNotesTab';

interface CombinedSessionNotesTabProps {
  clientId: string;
}

export const CombinedSessionNotesTab: React.FC<CombinedSessionNotesTabProps> = ({ clientId }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsResult, notesResult, homeworkResult] = await Promise.all([
        SessionNotesService.getSessions(clientId),
        SessionNotesService.getSessionNotes(clientId),
        SessionNotesService.getHomework(clientId)
      ]);

      if (sessionsResult.error) {
        toast({
          title: 'Error',
          description: sessionsResult.error,
          variant: 'destructive'
        });
      } else {
        setSessions(sessionsResult.data);
      }

      if (notesResult.error) {
        toast({
          title: 'Error',
          description: notesResult.error,
          variant: 'destructive'
        });
      } else {
        setSessionNotes(notesResult.data);
      }

      if (homeworkResult.error) {
        toast({
          title: 'Error',
          description: homeworkResult.error,
          variant: 'destructive'
        });
      } else {
        setHomework(homeworkResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHomeworkStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleHomeworkStatusUpdate = async (homeworkId: string, status: 'completed' | 'pending' | 'overdue') => {
    try {
      const updates = {
        status,
        ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
      };

      const { error } = await SessionNotesService.updateHomework(homeworkId, updates);
      
      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive'
        });
      } else {
        setHomework(prev => prev.map(hw => 
          hw.id === homeworkId ? { ...hw, ...updates } : hw
        ));
        toast({
          title: 'Success',
          description: 'Homework status updated'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update homework status',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Loading session data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="notes">Session Notes</TabsTrigger>
          <TabsTrigger value="homework">Homework</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Session History
                </CardTitle>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Session
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{formatDate(session.session_date)}</span>
                            <Clock className="h-4 w-4 text-gray-500 ml-2" />
                            <span className="text-sm text-gray-600">{formatTime(session.session_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{session.session_type}</Badge>
                            <Badge className={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                            {session.duration_minutes && (
                              <span className="text-sm text-gray-500">
                                {session.duration_minutes} minutes
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                      {session.summary_excerpt && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {session.summary_excerpt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>No sessions recorded yet</p>
                  <p className="text-sm mt-1">Schedule the first session to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <SessionNotesTab clientId={clientId} />
        </TabsContent>

        <TabsContent value="homework" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Homework Assignments
                </CardTitle>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Assignment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {homework.length > 0 ? (
                <div className="space-y-4">
                  {homework.map((hw) => (
                    <div key={hw.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{hw.title}</h3>
                          {hw.description && (
                            <p className="text-sm text-gray-600 mb-2">{hw.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Assigned: {formatDate(hw.assigned_date)}</span>
                            {hw.due_date && (
                              <span>Due: {formatDate(hw.due_date)}</span>
                            )}
                            {hw.completed_at && (
                              <span>Completed: {formatDate(hw.completed_at)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getHomeworkStatusColor(hw.status)}>
                            {hw.status}
                          </Badge>
                          {hw.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleHomeworkStatusUpdate(hw.id, 'completed')}
                            >
                              <CheckSquare className="h-4 w-4 mr-1" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>No homework assignments yet</p>
                  <p className="text-sm mt-1">Create the first assignment to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
