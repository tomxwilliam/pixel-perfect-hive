import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, Check, X, Shield, Users } from 'lucide-react';

interface AdminRequest {
  id: string;
  user_id: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

interface Admin {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  created_at: string;
}

interface AdminManagementProps {
  isSuperAdmin: boolean;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ isSuperAdmin }) => {
  const { user } = useAuth();
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdminRequests();
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  const fetchAdminRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_requests')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setAdminRequests((data as any) || []);
    } catch (error) {
      console.error('Error fetching admin requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin requests",
        variant: "destructive",
      });
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data as Admin[] || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admins",
        variant: "destructive",
      });
    }
  };

  const handleRequestAdminAccess = async () => {
    if (!requestEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First, check if user exists
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', requestEmail.trim())
        .single();

      if (profileError || !userProfile) {
        toast({
          title: "Error",
          description: "User not found with this email address",
          variant: "destructive",
        });
        return;
      }

      // Check if request already exists
      const { data: existingRequest, error: requestError } = await supabase
        .from('admin_requests')
        .select('id')
        .eq('user_id', userProfile.id)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        toast({
          title: "Error",
          description: "Admin request already exists for this user",
          variant: "destructive",
        });
        return;
      }

      // Create admin request
      const { error } = await supabase
        .from('admin_requests')
        .insert({
          user_id: userProfile.id,
          notes: requestNotes
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin access request submitted successfully",
      });

      setIsDialogOpen(false);
      setRequestEmail('');
      setRequestNotes('');
      fetchAdminRequests();
    } catch (error) {
      console.error('Error requesting admin access:', error);
      toast({
        title: "Error",
        description: "Failed to submit admin request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const request = adminRequests.find(r => r.id === requestId);
      if (!request) return;

      // Update request status
      const { error: requestError } = await supabase
        .from('admin_requests')
        .update({
          status: action,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // If approved, update user role
      if (action === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', request.user_id);

        if (profileError) throw profileError;
      }

      toast({
        title: "Success",
        description: `Admin request ${action} successfully`,
      });

      fetchAdminRequests();
      if (action === 'approved') {
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error updating admin request:', error);
      toast({
        title: "Error",
        description: "Failed to update admin request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAdmin = async (adminId: string) => {
    if (adminId === user?.id) {
      toast({
        title: "Error",
        description: "You cannot revoke your own admin access",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'customer' })
        .eq('id', adminId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin access revoked successfully",
      });

      fetchAdmins();
    } catch (error) {
      console.error('Error revoking admin access:', error);
      toast({
        title: "Error",
        description: "Failed to revoke admin access",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Super Admin Access Required</h3>
        <p className="text-muted-foreground">
          Only the super admin (tom@404codelab.com) can manage admin permissions.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4" variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Request Admin Access
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Admin Access</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Reason for admin access request..."
                />
              </div>
              <Button 
                onClick={handleRequestAdminAccess} 
                disabled={loading}
                className="w-full"
              >
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Admin Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Pending Admin Requests
            </span>
            <Badge variant="secondary">
              {adminRequests.length} pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adminRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No pending admin requests
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {request.profiles?.first_name || request.profiles?.last_name
                        ? `${request.profiles.first_name || ''} ${request.profiles.last_name || ''}`.trim()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{request.profiles?.email}</TableCell>
                    <TableCell>
                      {new Date(request.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{request.notes || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRequestAction(request.id, 'approved')}
                          disabled={loading}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRequestAction(request.id, 'rejected')}
                          disabled={loading}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Current Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Admins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    {admin.first_name || admin.last_name
                      ? `${admin.first_name || ''} ${admin.last_name || ''}`.trim()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {admin.email}
                      {admin.email === 'tom@404codelab.com' && (
                        <Badge variant="default">Super Admin</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {admin.id !== user?.id ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevokeAdmin(admin.id)}
                        disabled={loading}
                      >
                        Revoke Access
                      </Button>
                    ) : (
                      <Badge variant="outline">You</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;