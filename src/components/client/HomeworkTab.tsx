
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, CheckCircle, Clock } from 'lucide-react';

// Mock homework data that would come from session notes
const mockHomework = [
  {
    id: '1',
    sessionDate: '2024-01-15',
    title: 'Deep Breathing Exercises',
    description: 'Practice deep breathing exercises daily for 10 minutes',
    dueDate: '2024-01-22',
    status: 'pending',
    assignedBy: 'Dr. Smith'
  },
  {
    id: '2',
    sessionDate: '2024-01-08',
    title: 'Thought Record Worksheet',
    description: 'Complete thought record worksheet when experiencing negative thoughts',
    dueDate: '2024-01-15',
    status: 'completed',
    assignedBy: 'Dr. Smith'
  },
  {
    id: '3',
    sessionDate: '2024-01-01',
    title: 'Mindfulness Journal',
    description: 'Keep a daily mindfulness journal noting observations and feelings',
    dueDate: '2024-01-08',
    status: 'completed',
    assignedBy: 'Dr. Smith'
  }
];

interface HomeworkTabProps {
  loading?: boolean;
}

export const HomeworkTab: React.FC<HomeworkTabProps> = ({ loading = false }) => {
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

  const pendingHomework = mockHomework.filter(hw => hw.status === 'pending');
  const completedHomework = mockHomework.filter(hw => hw.status === 'completed');

  if (loading) {
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
              {pendingHomework.map((homework) => (
                <Card key={homework.id} className="border-l-4 border-l-yellow-600">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{homework.title}</h3>
                        <p className="text-gray-600 mt-1">{homework.description}</p>
                      </div>
                      <Badge className={`ml-4 ${getStatusColor(homework.status)} flex items-center`}>
                        {getStatusIcon(homework.status)}
                        <span className="ml-1 capitalize">{homework.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Assigned: {formatDate(homework.sessionDate)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {formatDate(homework.dueDate)}
                      </span>
                      <span>Assigned by: {homework.assignedBy}</span>
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
              {completedHomework.map((homework) => (
                <Card key={homework.id} className="border-l-4 border-l-green-600 opacity-75">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{homework.title}</h3>
                        <p className="text-gray-600 mt-1">{homework.description}</p>
                      </div>
                      <Badge className={`ml-4 ${getStatusColor(homework.status)} flex items-center`}>
                        {getStatusIcon(homework.status)}
                        <span className="ml-1 capitalize">{homework.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Assigned: {formatDate(homework.sessionDate)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {formatDate(homework.dueDate)}
                      </span>
                      <span>Assigned by: {homework.assignedBy}</span>
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
