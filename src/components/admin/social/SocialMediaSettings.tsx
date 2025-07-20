import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Users, 
  Bell, 
  Shield, 
  Clock,
  Zap,
  MessageSquare,
  Hash
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface SocialMediaPermissions {
  can_view: boolean;
  can_create_posts: boolean;
  can_schedule_posts: boolean;
  can_delete_posts: boolean;
  can_manage_accounts: boolean;
  can_view_analytics: boolean;
  notification_preferences: {
    failed_posts: boolean;
    scheduled_success: boolean;
    token_expiry: boolean;
  };
}

export function SocialMediaSettings() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [userPermissions, setUserPermissions] = useState<SocialMediaPermissions>({
    can_view: true,
    can_create_posts: false,
    can_schedule_posts: false,
    can_delete_posts: false,
    can_manage_accounts: false,
    can_view_analytics: false,
    notification_preferences: {
      failed_posts: true,
      scheduled_success: true,
      token_expiry: true
    }
  });
  const [autoPostSettings, setAutoPostSettings] = useState({
    enabled: false,
    default_hashtags: '',
    approval_required: true,
    posting_schedule: 'immediate'
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamMembers();
    fetchUserPermissions();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role')
        .neq('role', 'customer');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchUserPermissions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('social_media_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setUserPermissions({
          can_view: data.can_view,
          can_create_posts: data.can_create_posts,
          can_schedule_posts: data.can_schedule_posts,
          can_delete_posts: data.can_delete_posts,
          can_manage_accounts: data.can_manage_accounts,
          can_view_analytics: data.can_view_analytics,
          notification_preferences: (data.notification_preferences as any) || {
            failed_posts: true,
            scheduled_success: true,
            token_expiry: true
          }
        });
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (permission: keyof SocialMediaPermissions, value: boolean) => {
    if (!user) return;

    try {
      const updatedPermissions = { ...userPermissions, [permission]: value };
      setUserPermissions(updatedPermissions);

      const { error } = await supabase
        .from('social_media_settings')
        .upsert({
          user_id: user.id,
          ...updatedPermissions
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = async (setting: string, value: boolean) => {
    if (!user) return;

    try {
      const updatedNotifications = {
        ...userPermissions.notification_preferences,
        [setting]: value
      };
      
      const updatedPermissions = {
        ...userPermissions,
        notification_preferences: updatedNotifications
      };
      
      setUserPermissions(updatedPermissions);

      const { error } = await supabase
        .from('social_media_settings')
        .upsert({
          user_id: user.id,
          ...updatedPermissions
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            My Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="can_view">View Social Media</Label>
              <Switch
                id="can_view"
                checked={userPermissions.can_view}
                onCheckedChange={(checked) => handlePermissionChange('can_view', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="can_create_posts">Create Posts</Label>
              <Switch
                id="can_create_posts"
                checked={userPermissions.can_create_posts}
                onCheckedChange={(checked) => handlePermissionChange('can_create_posts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="can_schedule_posts">Schedule Posts</Label>
              <Switch
                id="can_schedule_posts"
                checked={userPermissions.can_schedule_posts}
                onCheckedChange={(checked) => handlePermissionChange('can_schedule_posts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="can_delete_posts">Delete Posts</Label>
              <Switch
                id="can_delete_posts"
                checked={userPermissions.can_delete_posts}
                onCheckedChange={(checked) => handlePermissionChange('can_delete_posts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="can_manage_accounts">Manage Accounts</Label>
              <Switch
                id="can_manage_accounts"
                checked={userPermissions.can_manage_accounts}
                onCheckedChange={(checked) => handlePermissionChange('can_manage_accounts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="can_view_analytics">View Analytics</Label>
              <Switch
                id="can_view_analytics"
                checked={userPermissions.can_view_analytics}
                onCheckedChange={(checked) => handlePermissionChange('can_view_analytics', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="failed_posts">Failed Posts</Label>
                <p className="text-sm text-muted-foreground">Get notified when posts fail to publish</p>
              </div>
              <Switch
                id="failed_posts"
                checked={userPermissions.notification_preferences.failed_posts}
                onCheckedChange={(checked) => handleNotificationChange('failed_posts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="scheduled_success">Scheduled Post Success</Label>
                <p className="text-sm text-muted-foreground">Get notified when scheduled posts are published</p>
              </div>
              <Switch
                id="scheduled_success"
                checked={userPermissions.notification_preferences.scheduled_success}
                onCheckedChange={(checked) => handleNotificationChange('scheduled_success', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="token_expiry">Token Expiry</Label>
                <p className="text-sm text-muted-foreground">Get notified when social media tokens are about to expire</p>
              </div>
              <Switch
                id="token_expiry"
                checked={userPermissions.notification_preferences.token_expiry}
                onCheckedChange={(checked) => handleNotificationChange('token_expiry', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-posting Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Auto-posting Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto_post_enabled">Enable Auto-posting</Label>
              <p className="text-sm text-muted-foreground">Automatically post content based on rules</p>
            </div>
            <Switch
              id="auto_post_enabled"
              checked={autoPostSettings.enabled}
              onCheckedChange={(checked) => setAutoPostSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {autoPostSettings.enabled && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default_hashtags">Default Hashtags</Label>
                  <Textarea
                    id="default_hashtags"
                    placeholder="Enter default hashtags separated by spaces"
                    value={autoPostSettings.default_hashtags}
                    onChange={(e) => setAutoPostSettings(prev => ({ ...prev, default_hashtags: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="approval_required">Require Approval</Label>
                    <p className="text-sm text-muted-foreground">All auto-posts need approval before publishing</p>
                  </div>
                  <Switch
                    id="approval_required"
                    checked={autoPostSettings.approval_required}
                    onCheckedChange={(checked) => setAutoPostSettings(prev => ({ ...prev, approval_required: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="posting_schedule">Default Posting Schedule</Label>
                  <Select 
                    value={autoPostSettings.posting_schedule} 
                    onValueChange={(value) => setAutoPostSettings(prev => ({ ...prev, posting_schedule: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Post Immediately</SelectItem>
                      <SelectItem value="peak_hours">During Peak Hours</SelectItem>
                      <SelectItem value="custom">Custom Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Team Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{member.first_name} {member.last_name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage Permissions
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save All Settings</Button>
      </div>
    </div>
  );
}