import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { ConfigurationTab } from '@/components/ConfigurationTab';
import { UsersTab } from '@/components/UsersTab';
import { BrandingTab } from '@/components/BrandingTab';
import { NoteTemplateSettings } from '@/components/practice/NoteTemplateSettings';

const SettingsPage = () => {
  const { user } = useAuth();
  const { updateProfile, changePassword, loading: profileLoading } = useProfile();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state - removed practice_name
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    licenseNumber: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');

  const handleSaveProfile = async () => {
    const success = await updateProfile({
      full_name: profileForm.fullName,
      phone: profileForm.phone,
      license_number: profileForm.licenseNumber
    });

    if (success) {
      // Profile saved successfully
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    const success = await changePassword(passwordForm.newPassword);
    
    if (success) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7 w-full max-w-3xl">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile picture.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-teal-100 text-teal-800 text-xl">
                        {user?.email?.charAt(0).toUpperCase() || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline">Change Photo</Button>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Dr. Jane Smith" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user?.email} disabled />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(555) 123-4567" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="licenseNumber">License Number</Label>
                        <Input 
                          id="licenseNumber" 
                          value={profileForm.licenseNumber}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                          placeholder="PSY12345" 
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        className="bg-teal-600 hover:bg-teal-700" 
                        onClick={handleSaveProfile}
                        disabled={profileLoading}
                      >
                        {profileLoading ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>
                  Manage your account security settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <div className="grid gap-4 mt-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          type="password" 
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          type="password" 
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                      </div>
                      {passwordError && (
                        <div className="text-red-600 text-sm">{passwordError}</div>
                      )}
                      <div>
                        <Button 
                          variant="outline" 
                          onClick={handleChangePassword}
                          disabled={!passwordForm.newPassword || !passwordForm.confirmPassword || profileLoading}
                        >
                          {profileLoading ? 'Changing...' : 'Change Password'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="font-medium">Enable 2FA</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium">Sessions</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage your active sessions.</p>
                    
                    <div className="mt-4 border rounded-lg divide-y">
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-500">Chrome on Windows • IP: 192.168.1.1</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Safari on iPhone</p>
                            <p className="text-sm text-gray-500">Last active: 2 days ago</p>
                          </div>
                          <Button variant="outline" size="sm">Revoke</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Manage how you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Session Reminders</p>
                          <p className="text-sm text-gray-500">Receive reminders before scheduled sessions.</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">New Client Bookings</p>
                          <p className="text-sm text-gray-500">Get notified when a new client books a session.</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Document Uploads</p>
                          <p className="text-sm text-gray-500">Notifications for new document uploads.</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium">SMS Notifications</h3>
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable SMS notifications</p>
                          <p className="text-sm text-gray-500">Receive important notifications via text message.</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number for SMS</Label>
                        <Input id="phone" placeholder="(555) 123-4567" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      className="bg-teal-600 hover:bg-teal-700" 
                      onClick={() => {}}
                    >
                      Save Notification Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-6">
            <NoteTemplateSettings />
          </TabsContent>
          
          <TabsContent value="configuration" className="space-y-6">
            <ConfigurationTab />
          </TabsContent>
          
          <TabsContent value="branding" className="space-y-6">
            <BrandingTab />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <UsersTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
