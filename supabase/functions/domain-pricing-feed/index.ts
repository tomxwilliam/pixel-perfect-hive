import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch domain pricing data
    const { data: pricingData, error } = await supabase
      .from('domain_tld_pricing')
      .select('*')
      .order('tld');

    if (error) {
      throw error;
    }

    // Format response as JSON feed
    const response = {
      rate: 0.7397,
      updated_at: new Date().toISOString(),
      domains: pricingData?.map(domain => ({
        extension: domain.tld,
        category: domain.category,
        prices: {
          "1_year": domain.reg_1y_gbp ? `£${domain.reg_1y_gbp.toFixed(2)}` : null,
          "2_years": domain.reg_2y_gbp ? `£${domain.reg_2y_gbp.toFixed(2)}` : null,
          "5_years": domain.reg_5y_gbp ? `£${domain.reg_5y_gbp.toFixed(2)}` : null,
          "10_years": domain.reg_10y_gbp ? `£${domain.reg_10y_gbp.toFixed(2)}` : null,
        },
        renewal: domain.renew_1y_gbp ? `£${domain.renew_1y_gbp.toFixed(2)}` : null,
        transfer: domain.transfer_1y_gbp ? `£${domain.transfer_1y_gbp.toFixed(2)}` : null,
        source: domain.source,
        updated_at: domain.updated_at,
        usd_prices: {
          "1_year": domain.reg_1y_usd ? `$${domain.reg_1y_usd.toFixed(2)}` : null,
          "2_years": domain.reg_2y_usd ? `$${domain.reg_2y_usd.toFixed(2)}` : null,
          "5_years": domain.reg_5y_usd ? `$${domain.reg_5y_usd.toFixed(2)}` : null,
          "10_years": domain.reg_10y_usd ? `$${domain.reg_10y_usd.toFixed(2)}` : null,
          renewal: domain.renew_1y_usd ? `$${domain.renew_1y_usd.toFixed(2)}` : null,
          transfer: domain.transfer_1y_usd ? `$${domain.transfer_1y_usd.toFixed(2)}` : null,
        }
      })) || []
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Domain pricing feed error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);