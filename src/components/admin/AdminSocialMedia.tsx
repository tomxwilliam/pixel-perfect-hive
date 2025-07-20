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
  Eye
} from "lucide-react";
import { SocialMediaDashboard } from "./social/SocialMediaDashboard";
import { SocialMediaComposer } from "./social/SocialMediaComposer";
import { SocialMediaCalendar } from "./social/SocialMediaCalendar";
import { SocialMediaAnalytics } from "./social/SocialMediaAnalytics";
import { SocialAccountManager } from "./social/SocialAccountManager";
import { SocialMediaSettings } from "./social/SocialMediaSettings";

export function AdminSocialMedia() {
  const [activeTab, setActiveTab] = useState("dashboard");

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