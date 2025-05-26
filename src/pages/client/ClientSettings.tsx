
import React, { useState, useEffect } from 'react';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Shield, Eye, Save } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';

const ClientSettingsPage = () => {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '(555) 987-6543'
  });

  const [notifications, setNotifications] = useState({
    sessionReminders: true,
    emailUpdates: true,
    smsNotifications: false,
    homeworkReminders: true
  });

  const [privacy, setPrivacy] = useState({
    shareProgressWithFamily: false,
    allowSessionRecording: false,
    shareAnonymousData: true
  });

  const { branding } = useBranding();
  
  // Apply branding colors to CSS variables
  useEffect(() => {
    if (branding.primary_color && branding.secondary_color) {
      document.documentElement.style.setProperty('--primary-color', branding.primary_color);
      document.documentElement.style.setProperty('--secondary-color', branding.secondary_color);
    }
  }, [branding.primary_color, branding.secondary_color]);

  const primaryColor = branding.primary_color || '#7c3aed';
  const secondaryColor = branding.secondary_color || '#8b5cf6';

  const handleProfileSave = () => {
    console.log('Saving profile:', profile);
    // In a real app, this would make an API call
  };

  const handleNotificationsSave = () => {
    console.log('Saving notifications:', notifications);
    // In a real app, this would make an API call
  };

  const handlePrivacySave = () => {
    console.log('Saving privacy settings:', privacy);
    // In a real app, this would make an API call
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: primaryColor }}>
            Account Settings
          </h1>
          <p className="text-gray-500">Manage your account preferences and privacy settings</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: primaryColor }}>
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4" style={{ color: primaryColor }}>
                    Emergency Contact
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="emergencyContact">Contact Name</Label>
                      <Input
                        id="emergencyContact"
                        value={profile.emergencyContact}
                        onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Contact Phone</Label>
                      <Input
                        id="emergencyPhone"
                        value={profile.emergencyPhone}
                        onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t">
                  <Button 
                    onClick={handleProfileSave}
                    style={{ 
                      backgroundColor: primaryColor,
                      color: 'white'
                    }}
                    className="hover:opacity-90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: primaryColor }}>
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Session Reminders</Label>
                      <p className="text-sm text-gray-500">
                        Receive reminders before your scheduled sessions
                      </p>
                    </div>
                    <Switch
                      checked={notifications.sessionReminders}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, sessionReminders: checked })
                      }
                      style={{ 
                        backgroundColor: notifications.sessionReminders ? primaryColor : undefined
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Updates</Label>
                      <p className="text-sm text-gray-500">
                        Get updates about your therapy progress via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailUpdates: checked })
                      }
                      style={{ 
                        backgroundColor: notifications.emailUpdates ? secondaryColor : undefined
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive text messages for important updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, smsNotifications: checked })
                      }
                      style={{ 
                        backgroundColor: notifications.smsNotifications ? primaryColor : undefined
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Homework Reminders</Label>
                      <p className="text-sm text-gray-500">
                        Get reminded about assignments and exercises
                      </p>
                    </div>
                    <Switch
                      checked={notifications.homeworkReminders}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, homeworkReminders: checked })
                      }
                      style={{ 
                        backgroundColor: notifications.homeworkReminders ? secondaryColor : undefined
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t">
                  <Button 
                    onClick={handleNotificationsSave}
                    style={{ 
                      backgroundColor: primaryColor,
                      color: 'white'
                    }}
                    className="hover:opacity-90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: primaryColor }}>
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Share Progress with Family</Label>
                      <p className="text-sm text-gray-500">
                        Allow designated family members to view your progress
                      </p>
                    </div>
                    <Switch
                      checked={privacy.shareProgressWithFamily}
                      onCheckedChange={(checked) => 
                        setPrivacy({ ...privacy, shareProgressWithFamily: checked })
                      }
                      style={{ 
                        backgroundColor: privacy.shareProgressWithFamily ? primaryColor : undefined
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Allow Session Recording</Label>
                      <p className="text-sm text-gray-500">
                        Permit recording of sessions for quality and training purposes
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allowSessionRecording}
                      onCheckedChange={(checked) => 
                        setPrivacy({ ...privacy, allowSessionRecording: checked })
                      }
                      style={{ 
                        backgroundColor: privacy.allowSessionRecording ? secondaryColor : undefined
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Share Anonymous Data</Label>
                      <p className="text-sm text-gray-500">
                        Help improve our services by sharing anonymized data
                      </p>
                    </div>
                    <Switch
                      checked={privacy.shareAnonymousData}
                      onCheckedChange={(checked) => 
                        setPrivacy({ ...privacy, shareAnonymousData: checked })
                      }
                      style={{ 
                        backgroundColor: privacy.shareAnonymousData ? primaryColor : undefined
                      }}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Eye className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-blue-900">Data Protection</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Your personal health information is protected under HIPAA regulations. 
                          We use industry-standard encryption to keep your data secure.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t">
                  <Button 
                    onClick={handlePrivacySave}
                    style={{ 
                      backgroundColor: primaryColor,
                      color: 'white'
                    }}
                    className="hover:opacity-90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
};

export default ClientSettingsPage;
