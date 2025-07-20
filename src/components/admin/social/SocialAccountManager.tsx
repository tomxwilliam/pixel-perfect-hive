import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Twitter, 
  Linkedin, 
  Users, 
  Settings, 
  RefreshCw, 
  Unlink,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SocialAccount {
  id: string;
  platform: string;
  account_username: string;
  account_display_name: string;
  account_id: string;
  follower_count: number;
  following_count: number;
  profile_image_url?: string;
  is_active: boolean;
  last_synced_at: string;
  token_expires_at?: string;
}

export function SocialAccountManager() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch social media accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="h-5 w-5" />;
      case 'linkedin': return <Linkedin className="h-5 w-5" />;
      default: return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'text-blue-500';
      case 'linkedin': return 'text-blue-600';
      default: return 'text-gray-500';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const isTokenExpiring = (account: SocialAccount) => {
    if (!account.token_expires_at) return false;
    const expiryDate = new Date(account.token_expires_at);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7;
  };

  const handleToggleAccount = async (accountId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ is_active: isActive })
        .eq('id', accountId);

      if (error) throw error;

      setAccounts(prev => prev.map(account => 
        account.id === accountId ? { ...account, is_active: isActive } : account
      ));

      toast({
        title: "Success",
        description: `Account ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling account:', error);
      toast({
        title: "Error",
        description: "Failed to update account status",
        variant: "destructive",
      });
    }
  };

  const handleRefreshAccount = async (accountId: string) => {
    setRefreshing(accountId);
    try {
      // TODO: Implement account refresh logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const { error } = await supabase
        .from('social_accounts')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', accountId);

      if (error) throw error;

      await fetchAccounts();
      toast({
        title: "Success",
        description: "Account data refreshed successfully",
      });
    } catch (error) {
      console.error('Error refreshing account:', error);
      toast({
        title: "Error",
        description: "Failed to refresh account data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(null);
    }
  };

  const handleDisconnectAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      setAccounts(prev => prev.filter(account => account.id !== accountId));
      toast({
        title: "Success",
        description: "Account disconnected successfully",
      });
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect account",
        variant: "destructive",
      });
    }
  };

  const handleConnectAccount = (platform: string) => {
    // TODO: Implement OAuth flow
    toast({
      title: "Coming Soon",
      description: `${platform} OAuth integration will be available soon`,
    });
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
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const connectedPlatforms = accounts.map(acc => acc.platform);
  const availablePlatforms = ['twitter', 'linkedin'].filter(platform => 
    !connectedPlatforms.includes(platform)
  );

  return (
    <div className="space-y-6">
      {/* Connection Status Alert */}
      {accounts.some(acc => isTokenExpiring(acc)) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some account tokens are expiring soon. Please refresh the affected accounts to maintain connectivity.
          </AlertDescription>
        </Alert>
      )}

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No social media accounts connected</p>
              <div className="flex justify-center gap-2">
                <Button onClick={() => handleConnectAccount('twitter')}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Connect Twitter
                </Button>
                <Button onClick={() => handleConnectAccount('linkedin')}>
                  <Linkedin className="h-4 w-4 mr-2" />
                  Connect LinkedIn
                </Button>
              </div>
            </div>
          ) : (
            accounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={getPlatformColor(account.platform)}>
                      {getPlatformIcon(account.platform)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {account.account_display_name || account.account_username}
                        </h3>
                        {account.is_active ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                        {isTokenExpiring(account) && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Token Expiring
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">@{account.account_username}</p>
                      <p className="text-xs text-muted-foreground">
                        Last synced: {new Date(account.last_synced_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={account.is_active}
                      onCheckedChange={(checked) => handleToggleAccount(account.id, checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Followers</p>
                    <p className="font-medium">{formatNumber(account.follower_count)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Following</p>
                    <p className="font-medium">{formatNumber(account.following_count)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRefreshAccount(account.id)}
                    disabled={refreshing === account.id}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing === account.id ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDisconnectAccount(account.id)}
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Available Platforms */}
      {availablePlatforms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connect New Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {availablePlatforms.map((platform) => (
                <div key={platform} className="border rounded-lg p-4 text-center space-y-3">
                  <div className={`flex justify-center ${getPlatformColor(platform)}`}>
                    {getPlatformIcon(platform)}
                  </div>
                  <div>
                    <h3 className="font-medium capitalize">{platform}</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your {platform} account to start posting
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleConnectAccount(platform)}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Connect {platform}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}