
import React, { useState } from 'react';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const ClientSettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSaveProfile = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
                      <AvatarFallback className="bg-purple-100 text-purple-800 text-xl">
                        {user?.email?.charAt(0).toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline">Change Photo</Button>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" placeholder="John Doe" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user?.email} disabled />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="(555) 123-4567" />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input id="dateOfBirth" type="date" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="123 Main St" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="Anytown" />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="CA" />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input id="zipCode" placeholder="12345" />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700" 
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>
                  Provide an emergency contact in case it's needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyName">Contact Name</Label>
                      <Input id="emergencyName" placeholder="Jane Doe" />
                    </div>
                    <div>
                      <Label htmlFor="emergencyRelation">Relationship</Label>
                      <Input id="emergencyRelation" placeholder="Spouse" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyPhone">Phone Number</Label>
                      <Input id="emergencyPhone" placeholder="(555) 123-4567" />
                    </div>
                    <div>
                      <Label htmlFor="emergencyEmail">Email (Optional)</Label>
                      <Input id="emergencyEmail" type="email" placeholder="jane@example.com" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline">Save Emergency Contact</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
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
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                      <div>
                        <Button variant="outline">Change Password</Button>
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
                    <h3 className="text-lg font-medium">Privacy Settings</h3>
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Share therapy progress with therapist</p>
                          <p className="text-sm text-gray-500">Allow your therapist to view your self-reported progress.</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Allow file sharing</p>
                          <p className="text-sm text-gray-500">Enable document sharing between you and your therapist.</p>
                        </div>
                        <Switch defaultChecked />
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
                          <p className="text-sm text-gray-500">Receive reminders 24 hours before your scheduled session.</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Session Notes</p>
                          <p className="text-sm text-gray-500">Get notified when your therapist shares notes with you.</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Appointment Changes</p>
                          <p className="text-sm text-gray-500">Notifications about rescheduled or cancelled appointments.</p>
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
                      className="bg-purple-600 hover:bg-purple-700" 
                      onClick={() => {}}
                    >
                      Save Notification Settings
                    </Button>
                  </div>
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
