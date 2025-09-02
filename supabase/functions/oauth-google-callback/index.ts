import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    console.log('OAuth callback received:', { code: !!code, state, error });

    if (error) {
      console.error('OAuth error:', error);
      const redirectUrl = `${url.origin}/admin?tab=settings&error=oauth_denied`;
      return Response.redirect(redirectUrl, 302);
    }

    if (!code || !state) {
      console.error('Missing code or state');
      const redirectUrl = `${url.origin}/admin?tab=settings&error=invalid_callback`;
      return Response.redirect(redirectUrl, 302);
    }

    // Parse state to get user ID
    const [stateToken, userId] = state.split(':');
    if (!userId) {
      console.error('Invalid state format');
      const redirectUrl = `${url.origin}/admin?tab=settings&error=invalid_state`;
      return Response.redirect(redirectUrl, 302);
    }

    // Get environment variables
    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const OAUTH_REDIRECT_BASE = Deno.env.get('OAUTH_REDIRECT_BASE');

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !OAUTH_REDIRECT_BASE) {
      console.error('Missing Google OAuth configuration');
      const redirectUrl = `${url.origin}/admin?tab=settings&error=config_missing`;
      return Response.redirect(redirectUrl, 302);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${OAUTH_REDIRECT_BASE}/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Token exchange response:', tokenData);

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      const redirectUrl = `${url.origin}/admin?tab=settings&error=token_exchange_failed`;
      return Response.redirect(redirectUrl, 302);
    }

    const { access_token, refresh_token, expires_in, scope } = tokenData;

    if (!access_token) {
      console.error('No access token received');
      const redirectUrl = `${url.origin}/admin?tab=settings&error=no_access_token`;
      return Response.redirect(redirectUrl, 302);
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();
    console.log('User info retrieved:', userInfo);

    // Calculate expires_at
    const expiresAt = new Date(Date.now() + (expires_in * 1000)).toISOString();

    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Upsert OAuth connection
    const { error: upsertError } = await supabaseClient
      .from('oauth_connections')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token,
        refresh_token,
        expires_at: expiresAt,
        scope,
        account_id: userInfo.sub,
        meta: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        },
      }, {
        onConflict: 'user_id,provider'
      });

    if (upsertError) {
      console.error('Database upsert error:', upsertError);
      const redirectUrl = `${url.origin}/admin?tab=settings&error=database_error`;
      return Response.redirect(redirectUrl, 302);
    }

    console.log('OAuth connection saved successfully');

    // Redirect back to admin panel with success
    const redirectUrl = `${url.origin}/admin?tab=settings&connected=google`;
    return Response.redirect(redirectUrl, 302);

  } catch (error) {
    console.error('OAuth callback error:', error);
    const url = new URL(req.url);
    const redirectUrl = `${url.origin}/admin?tab=settings&error=callback_error`;
    return Response.redirect(redirectUrl, 302);
  }
});