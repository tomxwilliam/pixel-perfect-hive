import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, data } = await req.json();

    switch (action) {
      case 'send_notification':
        return await sendNotification(supabaseAdmin, data);
      case 'log_activity':
        return await logActivity(supabaseAdmin, data);
      case 'send_status_change_notification':
        return await sendStatusChangeNotification(supabaseAdmin, data);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in admin-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

async function sendNotification(supabase: any, data: any) {
  const {
    user_id,
    title,
    message,
    type = 'info',
    category = 'general',
    related_id = null,
    created_by = null,
    action_url = null
  } = data;

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id,
      title,
      message,
      type,
      category,
      related_id,
      created_by,
      action_url
    });

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: 'Notification sent successfully' }),
    {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    }
  );
}

async function logActivity(supabase: any, data: any) {
  const {
    user_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    description,
    old_values = null,
    new_values = null
  } = data;

  const { error } = await supabase
    .from('activity_log')
    .insert({
      user_id,
      actor_id,
      action,
      entity_type,
      entity_id,
      description,
      old_values,
      new_values
    });

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: 'Activity logged successfully' }),
    {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    }
  );
}

async function sendStatusChangeNotification(supabase: any, data: any) {
  const {
    user_id,
    entity_type,
    entity_id,
    old_status,
    new_status,
    entity_title,
    created_by
  } = data;

  // Create notification
  const notificationTitle = `${entity_type.charAt(0).toUpperCase() + entity_type.slice(1)} Status Updated`;
  const notificationMessage = `Your ${entity_type} "${entity_title}" status has been changed from "${old_status}" to "${new_status}".`;
  
  await supabase
    .from('notifications')
    .insert({
      user_id,
      title: notificationTitle,
      message: notificationMessage,
      type: getNotificationType(new_status),
      category: entity_type,
      related_id: entity_id,
      created_by,
      action_url: `/dashboard?tab=${entity_type}s`
    });

  // Log activity
  await supabase
    .from('activity_log')
    .insert({
      user_id,
      actor_id: created_by,
      action: 'status_changed',
      entity_type,
      entity_id,
      description: `${entity_type} status changed from "${old_status}" to "${new_status}"`,
      old_values: { status: old_status },
      new_values: { status: new_status }
    });

  return new Response(
    JSON.stringify({ success: true, message: 'Status change notification sent successfully' }),
    {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    }
  );
}

function getNotificationType(status: string): string {
  const completedStatuses = ['completed', 'paid', 'resolved', 'closed', 'accepted'];
  const warningStatuses = ['overdue', 'failed', 'rejected'];
  const inProgressStatuses = ['in_progress', 'pending'];

  if (completedStatuses.includes(status)) return 'success';
  if (warningStatuses.includes(status)) return 'warning';
  if (inProgressStatuses.includes(status)) return 'info';
  
  return 'info';
}