
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, Eye } from 'lucide-react';
import { SessionHistory } from '@/repository/EnhancedClientRepository';

interface ClientSessionHistoryTabProps {
  clientId: string;
  sessions: SessionHistory[];
}

export const ClientSessionHistoryTab: React.FC<ClientSessionHistoryTabProps> = ({ 
  clientId, 
  sessions 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
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
              <div key={session.session_id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">{formatDate(session.session_date)}</div>
                      <div className="text-xs text-gray-500">{formatTime(session.session_date)}</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{session.session_type}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.duration_minutes} mins
                        </div>
                        <div>with {session.therapist_name}</div>
                      </div>
                      
                      {session.summary_excerpt && (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {session.summary_excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View/Edit Note
                  </Button>
                </div>
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
  );
};
