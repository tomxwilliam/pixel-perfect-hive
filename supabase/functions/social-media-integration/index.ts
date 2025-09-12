import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SocialPostRequest {
  platform: 'linkedin' | 'twitter';
  content: string;
  media_urls?: string[];
  scheduled_for?: string;
  hashtags?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'post':
        return await handlePost(supabaseClient, req);
      case 'schedule':
        return await handleSchedule(supabaseClient, req);
      case 'analytics':
        return await handleAnalytics(supabaseClient, req);
      case 'sync-accounts':
        return await handleSyncAccounts(supabaseClient, req);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Social media integration error:', error);
    return new Response(JSON.stringify({ 
      error: 'Social media operation failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handlePost(supabase: any, req: Request) {
  const { platform, content, media_urls, hashtags }: SocialPostRequest = await req.json();

  // Get OAuth connection for the platform
  const { data: oauthConnection } = await supabase
    .from('oauth_connections')
    .select('*')
    .eq('provider', platform)
    .single();

  if (!oauthConnection) {
    throw new Error(`${platform} account not connected`);
  }

  let result;
  
  if (platform === 'linkedin') {
    result = await postToLinkedIn(oauthConnection, content, media_urls, hashtags);
  } else if (platform === 'twitter') {
    result = await postToTwitter(oauthConnection, content, media_urls, hashtags);
  } else {
    throw new Error(`Platform ${platform} not supported`);
  }

  // Save post to database
  const { data: savedPost } = await supabase
    .from('social_posts')
    .insert({
      platform: platform,
      content: content,
      post_id: result.id,
      post_url: result.url,
      media_urls: media_urls || [],
      hashtags: hashtags || [],
      posted_at: new Date().toISOString(),
      character_count: content.length,
      engagement_likes: 0,
      engagement_comments: 0,
      engagement_shares: 0,
      engagement_views: 0
    })
    .select()
    .single();

  return new Response(JSON.stringify({ 
    success: true, 
    post: savedPost,
    platform_response: result
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function postToLinkedIn(oauthConnection: any, content: string, mediaUrls?: string[], hashtags?: string[]) {
  const accessToken = oauthConnection.access_token;
  
  // Build the post content with hashtags
  let fullContent = content;
  if (hashtags && hashtags.length > 0) {
    fullContent += '\n\n' + hashtags.map(tag => `#${tag}`).join(' ');
  }

  // Get user profile info
  const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileResponse.ok) {
    throw new Error('Failed to get LinkedIn profile info');
  }

  const profile = await profileResponse.json();
  const authorUrn = `urn:li:person:${profile.sub}`;

  // Create the post
  const postData = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: fullContent
        },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify(postData)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('LinkedIn post failed:', error);
    throw new Error(`LinkedIn post failed: ${error}`);
  }

  const result = await response.json();
  
  return {
    id: result.id,
    url: `https://www.linkedin.com/feed/update/${result.id}`,
    platform_data: result
  };
}

async function postToTwitter(oauthConnection: any, content: string, mediaUrls?: string[], hashtags?: string[]) {
  // This would integrate with the existing Twitter function
  // For now, we'll call the existing twitter-integration function
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabaseClient.functions.invoke('twitter-integration/post', {
    body: {
      content: content,
      hashtags: hashtags || [],
      media_urls: mediaUrls || []
    }
  });

  if (error) throw error;
  
  if (!data.success) {
    throw new Error(data.error || 'Twitter post failed');
  }

  return {
    id: data.tweet_id,
    url: data.tweet_url,
    platform_data: data
  };
}

async function handleSchedule(supabase: any, req: Request) {
  const { platform, content, media_urls, hashtags, scheduled_for }: SocialPostRequest = await req.json();

  // Save scheduled post
  const { data: scheduledPost } = await supabase
    .from('social_posts')
    .insert({
      platform: platform,
      content: content,
      media_urls: media_urls || [],
      hashtags: hashtags || [],
      scheduled_for: scheduled_for,
      character_count: content.length,
      engagement_likes: 0,
      engagement_comments: 0,
      engagement_shares: 0,
      engagement_views: 0
    })
    .select()
    .single();

  return new Response(JSON.stringify({ 
    success: true, 
    post: scheduledPost,
    message: 'Post scheduled successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleAnalytics(supabase: any, req: Request) {
  const { data: posts } = await supabase
    .from('social_posts')
    .select('*')
    .order('posted_at', { ascending: false })
    .limit(100);

  const analytics = {
    total_posts: posts?.length || 0,
    total_engagement: posts?.reduce((sum: number, post: any) => 
      sum + (post.engagement_likes || 0) + (post.engagement_comments || 0) + (post.engagement_shares || 0), 0) || 0,
    total_reach: posts?.reduce((sum: number, post: any) => sum + (post.engagement_views || 0), 0) || 0,
    platform_breakdown: {}
  };

  // Calculate platform breakdown
  posts?.forEach((post: any) => {
    if (!analytics.platform_breakdown[post.platform]) {
      analytics.platform_breakdown[post.platform] = {
        posts: 0,
        engagement: 0,
        reach: 0
      };
    }
    analytics.platform_breakdown[post.platform].posts++;
    analytics.platform_breakdown[post.platform].engagement += 
      (post.engagement_likes || 0) + (post.engagement_comments || 0) + (post.engagement_shares || 0);
    analytics.platform_breakdown[post.platform].reach += post.engagement_views || 0;
  });

  return new Response(JSON.stringify({ 
    success: true, 
    analytics: analytics
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleSyncAccounts(supabase: any, req: Request) {
  // Get all OAuth connections
  const { data: connections } = await supabase
    .from('oauth_connections')
    .select('*')
    .in('provider', ['twitter', 'linkedin']);

  const syncResults = [];

  for (const connection of connections || []) {
    try {
      let accountInfo;
      
      if (connection.provider === 'linkedin') {
        accountInfo = await syncLinkedInAccount(connection);
      } else if (connection.provider === 'twitter') {
        accountInfo = await syncTwitterAccount(connection);
      }

      if (accountInfo) {
        await supabase
          .from('social_accounts')
          .upsert({
            platform: connection.provider,
            account_username: accountInfo.username,
            account_display_name: accountInfo.display_name,
            account_id: accountInfo.id,
            follower_count: accountInfo.follower_count || 0,
            following_count: accountInfo.following_count || 0,
            profile_image_url: accountInfo.profile_image_url,
            is_active: true,
            last_synced_at: new Date().toISOString()
          }, {
            onConflict: 'platform,account_id'
          });

        syncResults.push({ provider: connection.provider, success: true });
      }
    } catch (error) {
      console.error(`Failed to sync ${connection.provider}:`, error);
      syncResults.push({ provider: connection.provider, success: false, error: error.message });
    }
  }

  return new Response(JSON.stringify({ 
    success: true, 
    results: syncResults
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function syncLinkedInAccount(connection: any) {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${connection.access_token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch LinkedIn profile');
  }

  const profile = await response.json();
  
  return {
    id: profile.sub,
    username: profile.email?.split('@')[0] || profile.sub,
    display_name: profile.name,
    profile_image_url: profile.picture,
    follower_count: 0, // LinkedIn API doesn't provide this in basic profile
    following_count: 0
  };
}

async function syncTwitterAccount(connection: any) {
  // This would use the Twitter API to get account info
  // For now, return mock data since the actual Twitter integration is complex
  return {
    id: connection.account_id,
    username: connection.meta?.username || 'twitter_user',
    display_name: connection.meta?.name || 'Twitter User',
    profile_image_url: connection.meta?.profile_image_url,
    follower_count: 0,
    following_count: 0
  };
}