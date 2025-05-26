
import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, FileText, TrendingUp, Clock, MessageSquare } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';

const PractitionerDashboard = () => {
  const { branding } = useBranding();
  
  // Apply branding colors to CSS variables
  useEffect(() => {
    if (branding.primary_color && branding.secondary_color) {
      document.documentElement.style.setProperty('--primary-color', branding.primary_color);
      document.documentElement.style.setProperty('--secondary-color', branding.secondary_color);
    }
  }, [branding.primary_color, branding.secondary_color]);

  const primaryColor = branding.primary_color || '#0f766e';
  const secondaryColor = branding.secondary_color || '#14b8a6';

  // Mock data
  const stats = {
    totalClients: 24,
    todaysSessions: 6,
    pendingNotes: 3,
    weeklyRevenue: 2400
  };

  const upcomingSessions = [
    { id: 1, clientName: 'Sarah Johnson', time: '10:00 AM', type: 'Initial Consultation' },
    { id: 2, clientName: 'Michael Chen', time: '11:30 AM', type: 'Follow-up' },
    { id: 3, clientName: 'Emma Wilson', time: '2:00 PM', type: 'Therapy Session' }
  ];

  const recentActivities = [
    { id: 1, action: 'Completed session notes for John Doe', time: '2 hours ago' },
    { id: 2, action: 'New client registration: Lisa Parker', time: '4 hours ago' },
    { id: 3, action: 'Updated treatment plan for Alex Brown', time: '6 hours ago' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: primaryColor }}>
            Practice Dashboard
          </h1>
          <p className="text-gray-500">Welcome back! Here's what's happening in your practice today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4" style={{ color: primaryColor }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: primaryColor }}>{stats.totalClients}</div>
              <p className="text-xs text-gray-500">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
              <Calendar className="h-4 w-4" style={{ color: secondaryColor }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: secondaryColor }}>{stats.todaysSessions}</div>
              <p className="text-xs text-gray-500">2 completed, 4 upcoming</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Notes</CardTitle>
              <FileText className="h-4 w-4" style={{ color: primaryColor }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: primaryColor }}>{stats.pendingNotes}</div>
              <p className="text-xs text-gray-500">Complete within 24hrs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: secondaryColor }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: secondaryColor }}>${stats.weeklyRevenue}</div>
              <p className="text-xs text-gray-500">+12% from last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: primaryColor }}>
                <Clock className="h-5 w-5 mr-2" />
                Today's Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{session.clientName}</p>
                      <p className="text-sm text-gray-500">{session.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium" style={{ color: secondaryColor }}>{session.time}</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="mt-1"
                        style={{ 
                          borderColor: primaryColor,
                          color: primaryColor
                        }}
                      >
                        Start Session
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: primaryColor }}>
                <MessageSquare className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="border-b pb-3 last:border-0">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: primaryColor }}>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button 
                className="flex flex-col h-20"
                style={{ 
                  backgroundColor: primaryColor,
                  color: 'white'
                }}
              >
                <Users className="h-5 w-5 mb-2" />
                Add New Client
              </Button>
              <Button 
                variant="outline"
                className="flex flex-col h-20"
                style={{ 
                  borderColor: secondaryColor,
                  color: secondaryColor
                }}
              >
                <Calendar className="h-5 w-5 mb-2" />
                Schedule Session
              </Button>
              <Button 
                variant="outline"
                className="flex flex-col h-20"
                style={{ 
                  borderColor: primaryColor,
                  color: primaryColor
                }}
              >
                <FileText className="h-5 w-5 mb-2" />
                Create Note
              </Button>
              <Button 
                variant="outline"
                className="flex flex-col h-20"
                style={{ 
                  borderColor: secondaryColor,
                  color: secondaryColor
                }}
              >
                <TrendingUp className="h-5 w-5 mb-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PractitionerDashboard;
