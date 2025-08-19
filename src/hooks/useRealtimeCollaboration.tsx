import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface UserPresence {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  online_at: string;
  current_project?: string;
  current_task?: string;
  cursor_position?: { x: number; y: number };
  selection?: { projectId?: string; taskId?: string };
}

export interface LiveComment {
  id: string;
  project_id: string;
  task_id?: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  mentions?: string[];
}

export interface LiveUpdate {
  id: string;
  type: 'task_update' | 'project_update' | 'comment_added' | 'user_joined' | 'user_left';
  data: any;
  user_id: string;
  user_name: string;
  timestamp: string;
}

export const useRealtimeCollaboration = (projectId?: string) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [liveComments, setLiveComments] = useState<LiveComment[]>([]);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [projectChannel, setProjectChannel] = useState<any>(null);

  // Track user presence
  const trackPresence = useCallback(async (projectId: string, taskId?: string) => {
    if (!user || !profile) return;

    const presenceData: UserPresence = {
      user_id: user.id,
      user_name: `${profile.first_name} ${profile.last_name}`.trim() || profile.email,
      avatar_url: profile.avatar_url,
      online_at: new Date().toISOString(),
      current_project: projectId,
      current_task: taskId,
    };

    if (projectChannel) {
      await projectChannel.track(presenceData);
    }
  }, [user, profile, projectChannel]);

  // Send live comment
  const sendComment = useCallback(async (content: string, taskId?: string, mentions?: string[]) => {
    if (!user || !profile || !projectId) return;

    const comment: LiveComment = {
      id: crypto.randomUUID(),
      project_id: projectId,
      task_id: taskId,
      user_id: user.id,
      user_name: `${profile.first_name} ${profile.last_name}`.trim() || profile.email,
      content,
      created_at: new Date().toISOString(),
      mentions,
    };

    // Send through real-time channel
    if (projectChannel) {
      await projectChannel.send({
        type: 'broadcast',
        event: 'live_comment',
        payload: comment,
      });
    }

    // Also save to database for persistence
    await supabase.from('project_comments').insert({
      project_id: projectId,
      task_id: taskId,
      author_id: user.id,
      content,
      mentions,
    });
  }, [user, profile, projectId, projectChannel]);

  // Broadcast live update
  const broadcastUpdate = useCallback(async (type: LiveUpdate['type'], data: any) => {
    if (!user || !profile || !projectChannel) return;

    const update: LiveUpdate = {
      id: crypto.randomUUID(),
      type,
      data,
      user_id: user.id,
      user_name: `${profile.first_name} ${profile.last_name}`.trim() || profile.email,
      timestamp: new Date().toISOString(),
    };

    await projectChannel.send({
      type: 'broadcast',
      event: 'live_update',
      payload: update,
    });
  }, [user, profile, projectChannel]);

  // Initialize real-time collaboration for a project
  useEffect(() => {
    if (!projectId || !user) return;

    const channel = supabase.channel(`project_collaboration_${projectId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Handle presence changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: UserPresence[] = [];
        Object.values(state).flat().forEach((presence: any) => {
          if (presence && typeof presence === 'object' && presence.user_id && presence.user_name) {
            users.push(presence as UserPresence);
          }
        });
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        toast({
          title: "User joined",
          description: `${newPresences[0]?.user_name} joined the project`,
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        toast({
          title: "User left",
          description: `${leftPresences[0]?.user_name} left the project`,
        });
      })
      // Handle live comments
      .on('broadcast', { event: 'live_comment' }, ({ payload }) => {
        setLiveComments(prev => [...prev, payload as LiveComment]);
        
        // Show notification if mentioned
        if (payload.mentions?.includes(user.id)) {
          toast({
            title: "You were mentioned",
            description: `${payload.user_name}: ${payload.content.substring(0, 50)}...`,
          });
        }
      })
      // Handle live updates
      .on('broadcast', { event: 'live_update' }, ({ payload }) => {
        setLiveUpdates(prev => [payload as LiveUpdate, ...prev].slice(0, 50)); // Keep last 50 updates
        
        toast({
          title: "Live Update",
          description: `${payload.user_name} ${payload.type.replace('_', ' ')}`,
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setProjectChannel(channel);
          await trackPresence(projectId);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setProjectChannel(null);
      setOnlineUsers([]);
      setLiveComments([]);
      setLiveUpdates([]);
    };
  }, [projectId, user, trackPresence, toast]);

  return {
    onlineUsers,
    liveComments,
    liveUpdates,
    trackPresence,
    sendComment,
    broadcastUpdate,
  };
};