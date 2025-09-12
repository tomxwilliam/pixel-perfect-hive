import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let userId: string | null = null;
  let projectId: string | null = null;
  let userPresence: any = {};

  socket.onopen = () => {
    console.log('WebSocket connection opened');
    socket.send(JSON.stringify({
      type: 'connection_established',
      timestamp: new Date().toISOString()
    }));
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);

      switch (message.type) {
        case 'authenticate':
          const authResult = await authenticateUser(supabaseClient, message.token);
          if (authResult.success) {
            userId = authResult.userId;
            socket.send(JSON.stringify({
              type: 'authenticated',
              userId: userId,
              timestamp: new Date().toISOString()
            }));
          } else {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Authentication failed',
              timestamp: new Date().toISOString()
            }));
          }
          break;

        case 'join_project':
          if (!userId) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Not authenticated'
            }));
            return;
          }
          
          projectId = message.projectId;
          userPresence = {
            userId,
            projectId,
            joinedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            currentTask: message.currentTask || null,
            status: 'active'
          };

          // Broadcast user joined
          await broadcastToProject(supabaseClient, projectId, {
            type: 'user_joined',
            user: userPresence,
            timestamp: new Date().toISOString()
          });

          socket.send(JSON.stringify({
            type: 'project_joined',
            projectId: projectId,
            timestamp: new Date().toISOString()
          }));
          break;

        case 'update_presence':
          if (userId && projectId) {
            userPresence = {
              ...userPresence,
              ...message.presence,
              lastActivity: new Date().toISOString()
            };

            await broadcastToProject(supabaseClient, projectId, {
              type: 'presence_update',
              user: userPresence,
              timestamp: new Date().toISOString()
            });
          }
          break;

        case 'send_comment':
          if (userId && projectId) {
            const comment = await saveComment(supabaseClient, {
              projectId,
              userId,
              content: message.content,
              taskId: message.taskId,
              mentions: message.mentions
            });

            await broadcastToProject(supabaseClient, projectId, {
              type: 'new_comment',
              comment: comment,
              timestamp: new Date().toISOString()
            });
          }
          break;

        case 'task_update':
          if (userId && projectId) {
            await handleTaskUpdate(supabaseClient, projectId, userId, message.update);
          }
          break;

        case 'cursor_position':
          if (userId && projectId) {
            await broadcastToProject(supabaseClient, projectId, {
              type: 'cursor_update',
              userId: userId,
              position: message.position,
              element: message.element,
              timestamp: new Date().toISOString()
            });
          }
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message',
        timestamp: new Date().toISOString()
      }));
    }
  };

  socket.onclose = async () => {
    console.log('WebSocket connection closed');
    if (userId && projectId) {
      await broadcastToProject(supabaseClient, projectId, {
        type: 'user_left',
        userId: userId,
        timestamp: new Date().toISOString()
      });
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return response;
});

async function authenticateUser(supabase: any, token: string) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { success: false };
    }

    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false };
  }
}

async function broadcastToProject(supabase: any, projectId: string, message: any) {
  try {
    // Store real-time event in database for persistence
    await supabase
      .from('project_realtime_events')
      .insert({
        project_id: projectId,
        event_type: message.type,
        event_data: message,
        created_at: new Date().toISOString()
      });

    // In a real implementation, you would broadcast to all connected clients
    // For now, we'll just log it
    console.log(`Broadcasting to project ${projectId}:`, message);
  } catch (error) {
    console.error('Error broadcasting message:', error);
  }
}

async function saveComment(supabase: any, commentData: any) {
  try {
    const { data, error } = await supabase
      .from('project_comments')
      .insert({
        project_id: commentData.projectId,
        author_id: commentData.userId,
        content: commentData.content,
        task_id: commentData.taskId,
        mentions: commentData.mentions,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Get user info for the comment
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, avatar_url')
      .eq('id', commentData.userId)
      .single();

    return {
      ...data,
      author_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
      author_avatar: profile?.avatar_url
    };
  } catch (error) {
    console.error('Error saving comment:', error);
    throw error;
  }
}

async function handleTaskUpdate(supabase: any, projectId: string, userId: string, update: any) {
  try {
    // Update the task
    const { error } = await supabase
      .from('project_tasks')
      .update(update)
      .eq('id', update.taskId);

    if (error) throw error;

    // Log the activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: userId,
        actor_id: userId,
        action: 'update',
        entity_type: 'task',
        entity_id: update.taskId,
        description: `Updated task: ${Object.keys(update).join(', ')}`,
        new_values: update,
        created_at: new Date().toISOString()
      });

    // Broadcast the update
    await broadcastToProject(supabase, projectId, {
      type: 'task_updated',
      taskId: update.taskId,
      update: update,
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error handling task update:', error);
  }
}