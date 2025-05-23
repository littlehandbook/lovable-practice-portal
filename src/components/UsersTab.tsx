
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface User {
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'practitioner';
  created_at: string;
}

export function UsersTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'practitioner'>('practitioner');

  const tenantId = user?.id || '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchUsers();
  }, [tenantId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('sp_get_tenant_users', {
        p_tenant_id: tenantId
      });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    if (!newUserEmail || !user) return;

    setAdding(true);
    try {
      // First, check if therapist exists
      const { data: therapistData, error: therapistError } = await supabase.rpc('sp_get_therapist_by_email', {
        p_email: newUserEmail
      });

      if (therapistError) throw therapistError;
      
      if (!therapistData || therapistData.length === 0) {
        toast({
          title: 'Error',
          description: 'No therapist found with this email address',
          variant: 'destructive'
        });
        return;
      }

      const therapist = therapistData[0];

      // Add user to tenant
      const { error: addError } = await supabase.rpc('sp_add_user_to_tenant', {
        p_user_id: therapist.id,
        p_tenant_id: tenantId,
        p_role: newUserRole,
        p_created_by: user.id
      });

      if (addError) throw addError;

      setNewUserEmail('');
      setNewUserRole('practitioner');
      await fetchUsers();

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new user form */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Add New User</h3>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Enter therapist email"
                disabled={adding}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newUserRole} onValueChange={(value: 'admin' | 'practitioner') => setNewUserRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="practitioner">Practitioner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={addUser}
              disabled={!newUserEmail || adding}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {adding ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </div>

        {/* Users list */}
        <div className="space-y-4">
          <h3 className="font-medium">Current Users</h3>
          {users.length === 0 ? (
            <p className="text-gray-500">No users found</p>
          ) : (
            <div className="border rounded-lg divide-y">
              {users.map((userData) => (
                <div key={userData.user_id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{userData.email}</p>
                    <p className="text-sm text-gray-500 capitalize">{userData.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      userData.role === 'owner' 
                        ? 'bg-purple-100 text-purple-800'
                        : userData.role === 'admin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {userData.role}
                    </span>
                    {userData.role !== 'owner' && (
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
