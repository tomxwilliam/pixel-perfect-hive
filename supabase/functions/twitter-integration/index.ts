import { createHmac } from "node:crypto";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get("X_CLIENT_ID")?.trim();
const API_SECRET = Deno.env.get("X_CLIENT_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

function validateEnvironmentVariables() {
  if (!API_KEY) {
    throw new Error("Missing X_CLIENT_ID environment variable");
  }
  if (!API_SECRET) {
    throw new Error("Missing X_CLIENT_SECRET environment variable");
  }
  if (!ACCESS_TOKEN) {
    throw new Error("Missing TWITTER_ACCESS_TOKEN environment variable");
  }
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error("Missing TWITTER_ACCESS_TOKEN_SECRET environment variable");
  }
}

// Generate OAuth signature for Twitter API
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  
  const signingKey = `${encodeURIComponent(
    consumerSecret
  )}&${encodeURIComponent(tokenSecret)}`;
  
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");

  console.log("Signature Base String:", signatureBaseString);
  console.log("Generated Signature:", signature);

  return signature;
}

function generateOAuthHeader(method: string, url: string): string {
  const oauthParams = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    API_SECRET!,
    ACCESS_TOKEN_SECRET!
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const entries = Object.entries(signedOAuthParams).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    "OAuth " +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

const BASE_URL = "https://api.twitter.com/2";

async function sendTweet(tweetText: string): Promise<any> {
  const url = `${BASE_URL}/tweets`;
  const method = "POST";
  const params = { text: tweetText };

  const oauthHeader = generateOAuthHeader(method, url);
  console.log("OAuth Header:", oauthHeader);

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const responseText = await response.text();
  console.log("Response Body:", responseText);

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${responseText}`
    );
  }

  return JSON.parse(responseText);
}

async function getUserProfile(): Promise<any> {
  const url = `https://api.twitter.com/1.1/account/verify_credentials.json?include_entities=false&skip_status=true&include_email=false`;
  const method = "GET";
  const oauthHeader = generateOAuthHeader(method, url);

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
  });

  const responseText = await response.text();
  console.log("User Profile Response:", responseText);

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${responseText}`
    );
  }

  return JSON.parse(responseText);
}

async function saveSocialPost(postData: any, tweetResponse: any) {
  try {
    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        platform: 'twitter',
        content: postData.content,
        hashtags: postData.hashtags || [],
        media_urls: postData.media_urls || [],
        posted_at: new Date().toISOString(),
        post_url: `https://twitter.com/i/web/status/${tweetResponse.data.id}`,
        platform_post_id: tweetResponse.data.id,
        character_count: postData.content.length,
        ai_generated: postData.ai_generated || false,
        engagement_likes: 0,
        engagement_comments: 0,
        engagement_shares: 0,
        engagement_views: 0
      });

    if (error) {
      console.error('Error saving post to database:', error);
    } else {
      console.log('Post saved to database:', data);
    }
  } catch (error) {
    console.error('Database error:', error);
  }
}

async function updateTwitterAccount(userProfile: any) {
  try {
    const username = userProfile.screen_name;
    const displayName = userProfile.name;
    const followers = userProfile.followers_count || 0;
    const following = userProfile.friends_count || 0;
    const avatar = userProfile.profile_image_url_https || userProfile.profile_image_url;

    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('platform', 'twitter')
      .eq('account_username', username)
      .maybeSingle();

    const accountData = {
      platform: 'twitter',
      account_username: username,
      account_display_name: displayName,
      follower_count: followers,
      following_count: following,
      is_active: true,
      profile_image_url: avatar,
      last_sync_at: new Date().toISOString()
    } as any;

    if (existingAccount && existingAccount.id) {
      await supabase
        .from('social_accounts')
        .update(accountData)
        .eq('id', existingAccount.id);
    } else {
      await supabase
        .from('social_accounts')
        .insert(accountData);
    }
  } catch (error) {
    console.error('Error updating Twitter account:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvironmentVariables();
    
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'post': {
        const body = await req.json();
        console.log("Received post request:", body);
        
        if (!body.content) {
          throw new Error("Content is required");
        }

        // Send tweet
        const tweetResponse = await sendTweet(body.content);
        console.log("Tweet posted successfully:", tweetResponse);

        // Save to database
        await saveSocialPost(body, tweetResponse);

        return new Response(JSON.stringify({
          success: true,
          data: tweetResponse,
          post_url: `https://twitter.com/i/web/status/${tweetResponse.data.id}`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case 'profile': {
        const userProfile = await getUserProfile();
        await updateTwitterAccount(userProfile);
        
        return new Response(JSON.stringify({
          success: true,
          data: userProfile
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case 'connect': {
        // Test connection and update account info
        const userProfile = await getUserProfile();
        await updateTwitterAccount(userProfile);

        // Update API integration status
        const { error: integrationError } = await supabase
          .from('api_integrations')
          .update({
            is_connected: true,
            last_sync_at: new Date().toISOString()
          })
          .eq('integration_type', 'twitter');

        if (integrationError) {
          console.error('Error updating integration status:', integrationError);
        }

        return new Response(JSON.stringify({
          success: true,
          message: "Twitter connection established successfully",
          data: userProfile
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({
          error: "Invalid action. Use /post, /profile, or /connect"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

  } catch (error: any) {
    console.error("Twitter integration error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});