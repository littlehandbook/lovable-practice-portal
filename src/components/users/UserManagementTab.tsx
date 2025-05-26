
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { UserService } from '@/service/UserService';
import { UserRole } from '@/repository/UserRepository';
import { useToast } from '@/hooks/use-toast';

interface UserManagementTabProps {
  userService: UserService;
  tenantId: string; // Now UUID string
  userId: string;
  roles: UserRole[];
  onUserAdded: () => void;
}

export function UserManagementTab({ userService, tenantId, userId, roles, onUserAdded }: UserManagementTabProps) {
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'practitioner'>('practitioner');

  const addUser = async () => {
    if (!newUserEmail || !newUserFirstName || !newUserLastName) return;

    setAdding(true);
    try {
      await userService.addUser(
        newUserEmail,
        newUserFirstName,
        newUserLastName,
        newUserRole,
        tenantId, // UUID string
        userId
      );

      setNewUserEmail('');
      setNewUserFirstName('');
      setNewUserLastName('');
      setNewUserRole('practitioner');
      
      onUserAdded();

      toast({
        title: 'Success',
        description: 'User added successfully'
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: 'Error',
        description: 'Failed to add user',
        variant: 'destructive'
      });
    } finally {
      setAdding(false);
    }
  };

  const userDropdownRoles = userService.getUserDropdownRoles(roles);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Add New User</h3>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUserFirstName}
                  onChange={(e) => setNewUserFirstName(e.target.value)}
                  placeholder="First name"
                  disabled={adding}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUserLastName}
                  onChange={(e) => setNewUserLastName(e.target.value)}
                  placeholder="Last name"
                  disabled={adding}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Enter email address"
                disabled={adding}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select 
                value={newUserRole} 
                onValueChange={(value: 'admin' | 'practitioner') => setNewUserRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {userDropdownRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={addUser}
              disabled={!newUserEmail || !newUserFirstName || !newUserLastName || adding}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {adding ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
