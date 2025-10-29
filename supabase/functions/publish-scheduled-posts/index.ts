import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Starting scheduled post publication check...');

    // Find scheduled posts that should be published
    const { data: posts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, scheduled_for')
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${posts?.length || 0} posts ready to publish`);

    const published = [];
    const failed = [];

    // Publish each scheduled post
    for (const post of posts || []) {
      console.log(`Publishing post: ${post.title} (${post.slug})`);
      
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          auto_published: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (updateError) {
        console.error(`Failed to publish post ${post.title}:`, updateError);
        failed.push({ 
          id: post.id, 
          title: post.title, 
          error: updateError.message 
        });
      } else {
        console.log(`Successfully published: ${post.title}`);
        published.push({ 
          id: post.id, 
          title: post.title,
          scheduled_for: post.scheduled_for
        });
      }
    }

    const result = {
      success: true,
      total_checked: posts?.length || 0,
      published_count: published.length,
      failed_count: failed.length,
      published,
      failed,
      timestamp: new Date().toISOString()
    };

    console.log('Publication check complete:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in publish-scheduled-posts:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
