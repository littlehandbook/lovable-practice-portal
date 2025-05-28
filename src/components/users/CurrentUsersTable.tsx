import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { User } from '@/types/user';

interface CurrentUsersTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
}

export function CurrentUsersTable({ users, loading, error }: CurrentUsersTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Users</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        ) : users.length === 0 ? (
          <p className="text-gray-500">No users found. Add your first user above.</p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userData) => (
                  <TableRow key={userData.user_id}>
                    <TableCell>
                      {userData.first_name && userData.last_name 
                        ? `${userData.first_name} ${userData.last_name}`
                        : 'User'}
                    </TableCell>
                    <TableCell>{userData.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        userData.role === 'owner' 
                          ? 'bg-purple-100 text-purple-800'
                          : userData.role === 'admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {userData.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {userData.role !== 'owner' && (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
