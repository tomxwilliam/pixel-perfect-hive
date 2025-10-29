
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

interface PendingInvitation {
  id: string;
  email: string;
  invited_by?: string;
  invited_at: string;
  notes?: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  invited_at: string;
  invited_by?: string;
  notes?: string;
}

interface AdminManagementProps {
  isSuperAdmin: boolean;
  superAdminUserId?: string; // Add super admin user ID to prevent removal
}

const AdminManagement: React.FC<AdminManagementProps> = ({ isSuperAdmin, superAdminUserId }) => {
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdminRequests();
      fetchAdminUsers();
      fetchPendingInvitations();
    }
  }, [isSuperAdmin]);

  const fetchAdminUsers = async () => {
    try {
      // Fetch user_roles with admin role
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (rolesError) {
        console.error('Error fetching admin roles:', rolesError);
        toast({
          title: "Error",
          description: "Failed to fetch admin users",
          variant: "destructive",
        });
        return;
      }

      if (!userRoles || userRoles.length === 0) {
        setAdminUsers([]);
        return;
      }

      // Fetch profiles for all admin user IDs
      const userIds = userRoles.map(role => role.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching admin profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to fetch admin user details",
          variant: "destructive",
        });
        return;
      }

      // Merge the data
      const adminProfiles = userRoles.map(role => {
        const profile = profiles?.find(p => p.id === role.user_id);
        return {
          id: profile?.id || role.user_id,
          email: profile?.email || 'Unknown',
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          created_at: profile?.created_at,
          role_created_at: role.created_at
        };
      });
      
      setAdminUsers(adminProfiles);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users",
        variant: "destructive",
      });
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_admin_invitations')
        .select('*')
        .order('invited_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending invitations:', error);
        return;
      }

      setPendingInvitations(data || []);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
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
    console.log('handlePromoteToAdmin called');
    console.log('isSuperAdmin:', isSuperAdmin);
    console.log('newAdminEmail:', newAdminEmail);
    
    if (!isSuperAdmin) {
      console.log('Access denied - not super admin');
      toast({
        title: "Access Denied",
        description: "Only super admin can promote users to admin",
        variant: "destructive",
      });
      return;
    }

    if (!newAdminEmail.trim()) {
      console.log('Email field is empty');
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    const email = newAdminEmail.trim().toLowerCase();
    console.log('Processing email:', email);

    setLoading(true);
    try {
      // BUSINESS LOGIC: Check if it's a company domain email
      // Note: This is a business rule for automatic admin assignment during signup
      // It's not used for authorisation checks - those use the user_roles table
      const is404CodeLabEmail = email.endsWith('@404codelab.com');
      
      // First check if user exists in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profile && !profileError) {
        // Check if user already has admin role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', profile.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (existingRole) {
          toast({
            title: "Already Admin",
            description: `${email} already has admin privileges`,
          });
          setNewAdminEmail('');
          return;
        }

        // Add admin role to user_roles table
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: profile.id,
            role: 'admin'
          });

        if (roleError) throw roleError;

        toast({
          title: "Success",
          description: `${email} has been promoted to admin`,
        });
        
        setNewAdminEmail('');
        fetchAdminUsers();
      } else {
        // User doesn't exist - create a pending invitation
        // Check if invitation already exists
        const { data: existingInvitation } = await supabase
          .from('pending_admin_invitations')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (existingInvitation) {
          toast({
            title: "Invitation Already Exists",
            description: `${email} already has a pending admin invitation. They will receive admin privileges when they sign up.`,
          });
          setNewAdminEmail('');
          return;
        }

        // Create pending invitation
        const { error: inviteError } = await supabase
          .from('pending_admin_invitations')
          .insert({
            email: email,
            invited_by: (await supabase.auth.getUser()).data.user?.id,
            notes: is404CodeLabEmail ? 'Company domain - auto-approved' : 'Manual invitation'
          });

        if (inviteError) throw inviteError;

        toast({
          title: "Pending Invitation Created",
          description: `${email} will automatically receive admin privileges when they create an account. You can delete this invitation from the Admin Access Requests section if needed.`,
        });
        
        setNewAdminEmail('');
        fetchPendingInvitations();
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

    // Prevent removing the super admin (first admin user)
    if (superAdminUserId && userId === superAdminUserId) {
      toast({
        title: "Cannot Remove Super Admin",
        description: "The super admin account cannot be removed",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Remove admin role from user_roles table
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

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
          Only administrators with super admin privileges can manage admin permissions.
        </p>
      </div>
    );
  }

  const handleDeleteInvitation = async (invitationId: string, email: string) => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super admin can delete pending invitations",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('pending_admin_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Pending invitation for ${email} has been deleted`,
      });

      fetchPendingInvitations();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to delete pending invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = adminRequests.filter(request => {
    if (requestFilter === 'all') return true;
    return request.status === requestFilter;
  });

  const pendingCount = adminRequests.filter(r => r.status === 'pending').length + pendingInvitations.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground">
          <p>Manage admin permissions and review admin access requests.</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
          </Badge>
        )}
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
                      {(!superAdminUserId || admin.id !== superAdminUserId) && (
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
                      {superAdminUserId && admin.id === superAdminUserId && (
                        <Badge variant="outline" className="text-xs">
                          Super Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Admin since: {new Date(admin.role_created_at || admin.created_at).toLocaleDateString()}
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Admin Access Requests
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingCount} Pending
                </Badge>
              )}
            </CardTitle>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              size="sm"
              variant={requestFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setRequestFilter('pending')}
            >
              <Clock className="h-4 w-4 mr-2" />
              Pending {pendingCount > 0 && `(${pendingCount})`}
            </Button>
            <Button
              size="sm"
              variant={requestFilter === 'approved' ? 'default' : 'outline'}
              onClick={() => setRequestFilter('approved')}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Approved
            </Button>
            <Button
              size="sm"
              variant={requestFilter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setRequestFilter('rejected')}
            >
              <UserX className="h-4 w-4 mr-2" />
              Rejected
            </Button>
            <Button
              size="sm"
              variant={requestFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setRequestFilter('all')}
            >
              All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Pending Invitations Section */}
          {requestFilter === 'pending' && pendingInvitations.length > 0 && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Pending Invitations (waiting for signup)</span>
              </div>
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className={`p-4 border border-dashed rounded-lg ${isMobile ? 'space-y-3' : ''}`}>
                  <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
                    <div className={`flex items-center gap-3 ${isMobile ? 'mb-2' : ''}`}>
                      <UserPlus className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{invitation.email}</h4>
                        <p className="text-sm text-muted-foreground">
                          Invited: {new Date(invitation.invited_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 ${isMobile ? 'flex-col w-full' : ''}`}>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending Signup
                      </Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteInvitation(invitation.id, invitation.email)}
                        disabled={loading}
                        className={isMobile ? 'w-full' : ''}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  {invitation.notes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {invitation.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Admin Requests Section */}
          {filteredRequests.length === 0 && (requestFilter !== 'pending' || pendingInvitations.length === 0) ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {requestFilter === 'pending' 
                  ? 'No pending admin requests' 
                  : `No ${requestFilter} requests found`}
              </p>
            </div>
          ) : filteredRequests.length > 0 ? (
                <div className="space-y-4">
                  {requestFilter === 'pending' && filteredRequests.length > 0 && (
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Admin Access Requests
                    </div>
                  )}
                  {filteredRequests.map((request) => (
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
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;
