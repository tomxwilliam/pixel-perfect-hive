import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DomainSearchRequest {
  domain: string;
  tlds?: string[];
}

interface DomainResult {
  domain: string;
  available: boolean;
  price: number;
  tld: string;
  premium?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { domain, tlds = ['.com', '.co.uk', '.org', '.net'] }: DomainSearchRequest = await req.json();

    console.log(`Searching for domain: ${domain}`);

    // Get domain pricing from settings
    const { data: settings } = await supabase
      .from('domain_hosting_settings')
      .select('domain_pricing')
      .single();

    const domainPricing = settings?.domain_pricing || {
      '.com': 12.99,
      '.co.uk': 9.99,
      '.org': 14.99,
      '.net': 13.99
    };

    const apiKey = Deno.env.get('OPENPROVIDER_API_KEY');
    const apiSecret = Deno.env.get('OPENPROVIDER_API_SECRET');

    let results: DomainResult[] = [];

    if (apiKey && apiSecret) {
      // Real OpenProvider API integration
      try {
        console.log('Using OpenProvider API for domain search');
        
        // OpenProvider authentication
        const authResponse = await fetch('https://api.openprovider.eu/v1beta/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: apiKey,
            password: apiSecret
          })
        });

        if (!authResponse.ok) {
          throw new Error('OpenProvider authentication failed');
        }

        const authData = await authResponse.json();
        const token = authData.data.token;

        // Search domains
        const searchResponse = await fetch('https://api.openprovider.eu/v1beta/domains/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            domains: tlds.map(tld => ({
              name: domain,
              extension: tld.replace('.', '')
            }))
          })
        });

        if (!searchResponse.ok) {
          throw new Error('Domain search failed');
        }

        const searchData = await searchResponse.json();
        
        results = searchData.data.results.map((result: any) => ({
          domain: `${result.domain.name}.${result.domain.extension}`,
          available: result.status === 'free',
          price: result.price?.product?.price || domainPricing[`.${result.domain.extension}`] || 12.99,
          tld: `.${result.domain.extension}`,
          premium: result.premium || false
        }));

      } catch (error) {
        console.error('OpenProvider API error:', error);
        // Fall back to mock data if API fails
        results = generateMockResults(domain, tlds, domainPricing);
      }
    } else {
      console.log('OpenProvider credentials not configured, using mock data');
      // Mock data when credentials not provided
      results = generateMockResults(domain, tlds, domainPricing);
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in domain-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

function generateMockResults(domain: string, tlds: string[], pricing: Record<string, number>): DomainResult[] {
  return tlds.map(tld => ({
    domain: `${domain}${tld}`,
    available: Math.random() > 0.5, // Random availability for demo
    price: pricing[tld] || 12.99,
    tld: tld,
    premium: Math.random() > 0.8 // 20% chance of premium
  }));
}

serve(handler);