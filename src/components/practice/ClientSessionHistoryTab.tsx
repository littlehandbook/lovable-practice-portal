
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, Eye } from 'lucide-react';

interface ClientSessionHistoryTabProps {
  clientId: string;
}

export const ClientSessionHistoryTab: React.FC<ClientSessionHistoryTabProps> = ({ 
  clientId
}) => {
  // Mock data for now - will be replaced with actual data loading
  const sessions = [];

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
            {sessions.map((session: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">Session Date</div>
                      <div className="text-xs text-gray-500">Time</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Session Type</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Status
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Duration
                        </div>
                        <div>with Therapist</div>
                      </div>
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
