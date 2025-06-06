
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, CheckCircle, Clock } from 'lucide-react';
import { SessionNotesService, type Homework } from '@/services/SessionNotesService';
import { useToast } from '@/hooks/use-toast';

interface HomeworkTabProps {
  loading?: boolean;
}

export const HomeworkTab: React.FC<HomeworkTabProps> = ({ loading: propLoading = false }) => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock client ID - in real app this would come from auth context
  const clientId = 'mock-client-id';

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const { data, error } = await SessionNotesService.getHomework(clientId);
        
        if (error) {
          console.error('Error fetching homework:', error);
          toast({
            title: 'Error',
            description: 'Failed to load homework assignments',
            variant: 'destructive'
          });
          return;
        }

        setHomework(data);
      } catch (error) {
        console.error('Unexpected error fetching homework:', error);
        toast({
          title: 'Error',
          description: 'Failed to load homework assignments',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();
  }, [clientId, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleMarkComplete = async (homeworkId: string) => {
    try {
      const { error } = await SessionNotesService.updateHomework(homeworkId, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to mark homework as complete',
          variant: 'destructive'
        });
        return;
      }

      // Update local state
      setHomework(prev => prev.map(hw => 
        hw.id === homeworkId 
          ? { ...hw, status: 'completed', completed_at: new Date().toISOString() }
          : hw
      ));

      toast({
        title: 'Success',
        description: 'Homework marked as complete',
      });
    } catch (error) {
      console.error('Error marking homework complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark homework as complete',
        variant: 'destructive'
      });
    }
  };

  const pendingHomework = homework.filter(hw => hw.status === 'pending');
  const completedHomework = homework.filter(hw => hw.status === 'completed');

  if (loading || propLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">Loading homework assignments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Homework */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-600" />
            Current Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingHomework.length > 0 ? (
            <div className="space-y-4">
              {pendingHomework.map((hw) => (
                <Card key={hw.id} className="border-l-4 border-l-yellow-600">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{hw.title}</h3>
                        {hw.description && (
                          <p className="text-gray-600 mt-1">{hw.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className={`${getStatusColor(hw.status)} flex items-center`}>
                          {getStatusIcon(hw.status)}
                          <span className="ml-1 capitalize">{hw.status}</span>
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleMarkComplete(hw.id)}
                        >
                          Mark Complete
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Assigned: {formatDate(hw.assigned_date)}
                      </span>
                      {hw.due_date && (
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due: {formatDate(hw.due_date)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No current homework assignments.</p>
              <p className="text-sm mt-1">New assignments will appear here after your sessions.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Homework */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Completed Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedHomework.length > 0 ? (
            <div className="space-y-4">
              {completedHomework.map((hw) => (
                <Card key={hw.id} className="border-l-4 border-l-green-600 opacity-75">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{hw.title}</h3>
                        {hw.description && (
                          <p className="text-gray-600 mt-1">{hw.description}</p>
                        )}
                      </div>
                      <Badge className={`ml-4 ${getStatusColor(hw.status)} flex items-center`}>
                        {getStatusIcon(hw.status)}
                        <span className="ml-1 capitalize">{hw.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Assigned: {formatDate(hw.assigned_date)}
                      </span>
                      {hw.due_date && (
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due: {formatDate(hw.due_date)}
                        </span>
                      )}
                      {hw.completed_at && (
                        <span className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed: {formatDate(hw.completed_at)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No completed assignments yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
