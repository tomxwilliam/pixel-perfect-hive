
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserPlus, UserCheck, UserX, Shield, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminRequest {
  id: string;
  user_id: string;
  status: string;
  requested_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  profiles?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

interface AdminManagementProps {
  isSuperAdmin: boolean;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ isSuperAdmin }) => {
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdminRequests();
      fetchAdminUsers();
    }
  }, [isSuperAdmin]);

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at')
        .eq('role', 'admin')
        .order('email');

      if (error) {
        console.error('Error fetching admin users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch admin users",
          variant: "destructive",
        });
        return;
      }

      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users",
        variant: "destructive",
      });
    }
  };

  const fetchAdminRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_requests')
        .select(`
          id,
          user_id,
          status,
          requested_at,
          reviewed_by,
          reviewed_at,
          notes,
          created_at,
          updated_at,
          profiles!admin_requests_user_id_fkey (
            email,
            first_name,
            last_name
          )
        `)
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin requests:', error);
        toast({
          title: "Error",
          description: "Failed to fetch admin requests",
          variant: "destructive",
        });
        return;
      }

      setAdminRequests(data || []);
    } catch (error) {
      console.error('Error fetching admin requests:', error);
      toast({
        title: "Error", 
        description: "Failed to fetch admin requests",
        variant: "destructive",
      });
    }
  };

  const handleRequestResponse = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super admin can manage admin requests",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_requests')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          notes: notes || null
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Admin request ${status} successfully`,
      });

      fetchAdminRequests();
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

  const handlePromoteToAdmin = async () => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super admin can promote users to admin",
        variant: "destructive",
      });
      return;
    }

    if (!newAdminEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    const email = newAdminEmail.trim().toLowerCase();

    setLoading(true);
    try {
      // Check if it's a @404codelab.com email
      const is404CodeLabEmail = email.endsWith('@404codelab.com');
      
      // First check if user exists in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profile && !profileError) {
        // User exists in profiles, update their role directly
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', profile.id);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: `${email} has been promoted to admin`,
        });
        
        setNewAdminEmail('');
      } else if (is404CodeLabEmail) {
        // For @404codelab.com emails, they'll automatically be admin when they sign up
        toast({
          title: "Admin Role Configured",
          description: `${email} will automatically have admin privileges when they sign up. All @404codelab.com emails are automatically assigned admin role.`,
        });
        
        setNewAdminEmail('');
      } else {
        // User doesn't exist and it's not a @404codelab.com email
        toast({
          title: "User Not Found",
          description: `No user found with email ${email}. The user must sign up and create an account first before being promoted to admin.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      toast({
        title: "Error",
        description: "Failed to promote user to admin. Please check the email address and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId: string, userEmail: string) => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super admin can remove admin privileges",
        variant: "destructive",
      });
      return;
    }

    // Prevent removing tom@404codelab.com
    if (userEmail === 'tom@404codelab.com') {
      toast({
        title: "Cannot Remove Super Admin",
        description: "The super admin account cannot be removed",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'customer' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Admin privileges removed from ${userEmail}`,
      });

      // Refresh the admin users list
      fetchAdminUsers();
    } catch (error) {
      console.error('Error removing admin privileges:', error);
      toast({
        title: "Error",
        description: "Failed to remove admin privileges",
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground">
        <p>Manage admin permissions and review admin access requests.</p>
      </div>

      {/* Promote User to Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Promote User to Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4`}>
            <div className="flex-1">
              <Label htmlFor="admin_email">Email Address</Label>
              <Input
                id="admin_email"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={loading}
              />
            </div>
            <div className={`flex items-end ${isMobile ? 'w-full' : ''}`}>
              <Button 
                onClick={handlePromoteToAdmin}
                disabled={loading || !newAdminEmail.trim()}
                className={isMobile ? 'w-full' : ''}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Promote to Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Admin Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Admin Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adminUsers.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No admin users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminUsers.map((admin) => (
                <div key={admin.id} className={`p-4 border rounded-lg ${isMobile ? 'space-y-3' : ''}`}>
                  <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
                    <div className={`flex items-center gap-3 ${isMobile ? 'mb-2' : ''}`}>
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">
                          {admin.first_name && admin.last_name 
                            ? `${admin.first_name} ${admin.last_name}`
                            : admin.email
                          }
                        </h4>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 ${isMobile ? 'flex-col w-full' : ''}`}>
                      <Badge variant="default" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                      {admin.email !== 'tom@404codelab.com' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                          disabled={loading}
                          className={isMobile ? 'w-full' : ''}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Remove Admin
                        </Button>
                      )}
                      {admin.email === 'tom@404codelab.com' && (
                        <Badge variant="outline" className="text-xs">
                          Super Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Admin since: {new Date(admin.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Admin Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adminRequests.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No admin requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminRequests.map((request) => (
                <div key={request.id} className={`p-4 border rounded-lg ${isMobile ? 'space-y-3' : ''}`}>
                  <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
                    <div className={`flex items-center gap-3 ${isMobile ? 'mb-2' : ''}`}>
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">
                          {request.profiles?.first_name && request.profiles?.last_name 
                            ? `${request.profiles.first_name} ${request.profiles.last_name}`
                            : request.profiles?.email || 'Unknown User'
                          }
                        </h4>
                        <p className="text-sm text-muted-foreground">{request.profiles?.email}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 ${isMobile ? 'flex-col w-full' : ''}`}>
                      <Badge 
                        variant={
                          request.status === 'approved' ? 'default' : 
                          request.status === 'rejected' ? 'destructive' : 
                          'secondary'
                        }
                        className="flex items-center gap-1"
                      >
                        {request.status === 'approved' && <UserCheck className="h-3 w-3" />}
                        {request.status === 'rejected' && <UserX className="h-3 w-3" />}
                        {request.status === 'pending' && <Clock className="h-3 w-3" />}
                        {request.status}
                      </Badge>
                      {request.status === 'pending' && (
                        <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
                          <Button
                            size="sm"
                            onClick={() => handleRequestResponse(request.id, 'approved')}
                            disabled={loading}
                            className={isMobile ? 'flex-1' : ''}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestResponse(request.id, 'rejected')}
                            disabled={loading}
                            className={isMobile ? 'flex-1' : ''}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Requested: {new Date(request.requested_at).toLocaleDateString()}
                    {request.reviewed_at && (
                      <span className="ml-2">
                        • Reviewed: {new Date(request.reviewed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {request.notes && (
                    <div className="mt-2 text-sm bg-muted p-2 rounded">
                      <strong>Notes:</strong> {request.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;
