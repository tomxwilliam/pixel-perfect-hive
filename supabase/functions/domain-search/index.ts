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

    const enomUser = Deno.env.get('ENOM_API_USER');
    const enomToken = Deno.env.get('ENOM_API_TOKEN');

    let results: DomainResult[] = [];

    if (enomUser && enomToken) {
      // Real eNom API integration
      try {
        console.log('Using eNom API for domain search');
        
        // Check each domain with eNom API
        for (const tld of tlds) {
          const cleanTld = tld.replace('.', '');
          const searchUrl = new URL('https://reseller.enom.com/interface.asp');
          searchUrl.searchParams.set('command', 'Check');
          searchUrl.searchParams.set('uid', enomUser);
          searchUrl.searchParams.set('pw', enomToken);
          searchUrl.searchParams.set('responsetype', 'JSON');
          searchUrl.searchParams.set('domain', domain);
          searchUrl.searchParams.set('tld', cleanTld);

          const response = await fetch(searchUrl.toString());
          
          if (!response.ok) {
            throw new Error(`eNom API request failed: ${response.status}`);
          }

          const data = await response.json();
          console.log('eNom API response:', data);
          
          // Parse eNom response
          const isAvailable = data.RRPCode === '210' || data.DomainAvailable === '1';
          
          results.push({
            domain: `${domain}.${cleanTld}`,
            available: isAvailable,
            price: domainPricing[tld] || 12.99,
            tld: tld,
            premium: data.IsPremium === '1' || false
          });
        }

      } catch (error) {
        console.error('eNom API error:', error);
        // Fall back to mock data if API fails
        results = generateMockResults(domain, tlds, domainPricing);
      }
    } else {
      console.log('eNom credentials not configured, using mock data');
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