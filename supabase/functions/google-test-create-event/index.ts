import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to refresh Google token
async function refreshGoogleToken(refreshToken: string) {
  const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
  const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Token refresh failed: ${data.error_description || data.error}`);
  }

  return {
    access_token: data.access_token,
    expires_at: new Date(Date.now() + (data.expires_in * 1000)).toISOString(),
  };
}

// Helper function to get valid Google access token
async function getGoogleAccessTokenForUser(userId: string, supabaseClient: any) {
  // Load OAuth connection
  const { data: connection, error } = await supabaseClient
    .from('oauth_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();

  if (error || !connection) {
    throw new Error('Google account not connected');
  }

  // Check if token is expired (with 5 minute buffer)
  const expiresAt = new Date(connection.expires_at);
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  if (now.getTime() + bufferTime >= expiresAt.getTime()) {
    console.log('Token expired, refreshing...');
    
    if (!connection.refresh_token) {
      throw new Error('No refresh token available');
    }

    // Refresh the token
    const { access_token, expires_at: newExpiresAt } = await refreshGoogleToken(connection.refresh_token);

    // Update the database
    await supabaseClient
      .from('oauth_connections')
      .update({
        access_token,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', 'google');

    return access_token;
  }

  return connection.access_token;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get valid access token
    let accessToken;
    try {
      accessToken = await getGoogleAccessTokenForUser(user.id, supabaseClient);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create test calendar event
    const now = new Date();
    const startTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    const eventData = {
      summary: '404 Code Lab Test Event',
      description: 'This is a test event created by the 404 Code Lab admin system to verify Google Calendar integration.',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
    };

    console.log('Creating calendar event:', eventData);

    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    const eventResult = await calendarResponse.json();
    console.log('Calendar API response:', eventResult);

    if (!calendarResponse.ok) {
      console.error('Calendar API error:', eventResult);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create calendar event',
          details: eventResult.error?.message || 'Unknown error'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Test event created successfully:', eventResult.id);

    return new Response(
      JSON.stringify({
        success: true,
        event: {
          id: eventResult.id,
          summary: eventResult.summary,
          start: eventResult.start,
          end: eventResult.end,
          htmlLink: eventResult.htmlLink,
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Test create event error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});