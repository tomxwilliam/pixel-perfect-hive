import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      const redirectUrl = `${Deno.env.get('OAUTH_REDIRECT_BASE')}/admin?error=oauth_denied`;
      return Response.redirect(redirectUrl, 302);
    }

    if (!code || !state) {
      const redirectUrl = `${Deno.env.get('OAUTH_REDIRECT_BASE')}/admin?error=invalid_callback`;
      return Response.redirect(redirectUrl, 302);
    }

    // Parse user ID from state
    const userId = state.split('-')[0];
    if (!userId) {
      const redirectUrl = `${Deno.env.get('OAUTH_REDIRECT_BASE')}/admin?error=invalid_state`;
      return Response.redirect(redirectUrl, 302);
    }

    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
    const redirectUri = `${Deno.env.get('OAUTH_REDIRECT_BASE')}/linkedin-oauth-callback`;

    if (!clientId || !clientSecret) {
      const redirectUrl = `${Deno.env.get('OAUTH_REDIRECT_BASE')}/admin?error=config_missing`;
      return Response.redirect(redirectUrl, 302);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('LinkedIn token response:', tokenData);

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      const redirectUrl = `${Deno.env.get('OAUTH_REDIRECT_BASE')}/admin?error=token_exchange_failed`;
      return Response.redirect(redirectUrl, 302);
    }

    // Get user info from LinkedIn
    const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userInfo = await userInfoResponse.json();
    console.log('LinkedIn user info:', userInfo);

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info:', userInfo);
      const redirectUrl = `${Deno.env.get('OAUTH_REDIRECT_BASE')}/admin?error=no_user_info`;
      return Response.redirect(redirectUrl, 302);
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();

    // Store in Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await supabaseClient
      .from('oauth_connections')
      .upsert({
        user_id: userId,
        provider: 'linkedin',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_at: expiresAt,
        scope: tokenData.scope || null,
        account_id: userInfo.sub,
        meta: {
          email: userInfo.email,
          name: userInfo.name,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          picture: userInfo.picture,
          locale: userInfo.locale,
        }
      }, {
        onConflict: 'user_id,provider'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      const redirectUrl = `${Deno.env.get('OAUTH_REDIRECT_BASE')}/admin?error=database_error`;
      return Response.redirect(redirectUrl, 302);
    }

    // Also create/update social account record
    await supabaseClient
      .from('social_accounts')
      .upsert({
        platform: 'linkedin',
        account_username: userInfo.email?.split('@')[0] || userInfo.sub,
        account_display_name: userInfo.name || userInfo.given_name,
        account_id: userInfo.sub,
        profile_image_url: userInfo.picture,
        is_active: true,
        last_synced_at: new Date().toISOString(),
        follower_count: 0,
        following_count: 0
      }, {
        onConflict: 'platform,account_id'
      });

    console.log('LinkedIn OAuth completed successfully');
    
    // Redirect back to admin with success
    const successUrl = `${Deno.env.get('OAUTH_REDIRECT_BASE')}/admin?connected=linkedin`;
    return Response.redirect(successUrl, 302);

  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
    const errorUrl = `${Deno.env.get('OAUTH_REDIRECT_BASE')}/admin?error=callback_error`;
    return Response.redirect(errorUrl, 302);
  }
});