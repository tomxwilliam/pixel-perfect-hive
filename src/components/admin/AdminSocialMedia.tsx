import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Calendar, 
  Edit3, 
  Settings, 
  Twitter, 
  Linkedin, 
  Users, 
  TrendingUp,
  MessageSquare,
  Heart,
  Share2,
  Eye,
  RefreshCw,
  Send
} from "lucide-react";
import { SocialMediaDashboard } from "./social/SocialMediaDashboard";
import { SocialMediaComposer } from "./social/SocialMediaComposer";
import { SocialMediaCalendar } from "./social/SocialMediaCalendar";
import { SocialMediaAnalytics } from "./social/SocialMediaAnalytics";
import { SocialAccountManager } from "./social/SocialAccountManager";
import { SocialMediaSettings } from "./social/SocialMediaSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function AdminSocialMedia() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [syncing, setSyncing] = useState(false);
  const [tweeting, setTweeting] = useState(false);
  const { toast } = useToast();

  const handleSyncProfile = async () => {
    try {
      setSyncing(true);
      const { data, error } = await supabase.functions.invoke('twitter-integration/profile', {
        body: {}
      });
      if (error) throw error as any;
      toast({ title: 'Twitter profile synced', description: 'Account info updated successfully.' });
    } catch (e: any) {
      toast({ title: 'Sync failed', description: e.message || 'Unable to sync profile', variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  const handleSendTestTweet = async () => {
    try {
      setTweeting(true);
      const testContent = `Test tweet from 404Codelab integration ${new Date().toLocaleString()}`;
      const { data, error } = await supabase.functions.invoke('twitter-integration/post', {
        body: {
          content: testContent,
          hashtags: [],
          media_urls: [],
          scheduled_for: null,
          platforms: ['twitter'],
          ai_generated: false
        }
      });
      if (error) throw error as any;
      if (data?.success) {
        toast({ title: 'Test tweet sent', description: 'View on X/Twitter via your profile.' });
      } else {
        toast({ title: 'Tweet failed', description: data?.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Tweet failed', description: e.message || 'Unable to post tweet', variant: 'destructive' });
    } finally {
      setTweeting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Manager</h1>
          <p className="text-muted-foreground">
            Manage and schedule posts across Twitter and LinkedIn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Twitter className="h-3 w-3" />
            Connected
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Linkedin className="h-3 w-3" />
            Connected
          </Badge>
          <Button variant="outline" size="sm" onClick={handleSyncProfile} disabled={syncing}>
            <RefreshCw className="h-3 w-3 mr-1" /> {syncing ? 'Syncing...' : 'Sync Twitter'}
          </Button>
          <Button size="sm" onClick={handleSendTestTweet} disabled={tweeting}>
            <Send className="h-3 w-3 mr-1" /> {tweeting ? 'Posting...' : 'Send Test Tweet'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="composer" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Composer
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <Users className="h-4 w-4" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <SocialMediaDashboard />
        </TabsContent>

        <TabsContent value="composer" className="space-y-6">
          <SocialMediaComposer />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <SocialMediaCalendar />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <SocialMediaAnalytics />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <SocialAccountManager />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SocialMediaSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}