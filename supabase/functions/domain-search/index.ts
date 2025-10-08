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

    // Ensure domain doesn't already contain a TLD
    let cleanDomain = domain.toLowerCase().trim();
    const allTlds = ['.com', '.co.uk', '.org', '.net', '.uk', '.io', '.ai', '.app', '.dev', '.co'];
    
    for (const tld of allTlds) {
      if (cleanDomain.endsWith(tld)) {
        cleanDomain = cleanDomain.slice(0, -tld.length);
        break;
      }
    }
    
    // Remove any special characters except hyphens
    cleanDomain = cleanDomain.replace(/[^a-z0-9-]/g, '');

    console.log(`Searching for domain: ${cleanDomain} with TLDs:`, tlds);

    // Get domain pricing from domain_tld_pricing table
    const { data: tldPricing } = await supabase
      .from('domain_tld_pricing')
      .select('tld, registration_price');

    const domainPricing: Record<string, number> = {};
    if (tldPricing && tldPricing.length > 0) {
      tldPricing.forEach((item) => {
        domainPricing[item.tld] = item.registration_price;
      });
    } else {
      // Fallback pricing if no data in table
      domainPricing['.com'] = 12.99;
      domainPricing['.co.uk'] = 9.99;
      domainPricing['.org'] = 14.99;
      domainPricing['.net'] = 13.99;
    }

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
          searchUrl.searchParams.set('domain', cleanDomain);
          searchUrl.searchParams.set('tld', cleanTld);

          const response = await fetch(searchUrl.toString());
          
          if (!response.ok) {
            throw new Error(`eNom API request failed: ${response.status}`);
          }

          const data = await response.json();
          console.log('eNom API response:', data);
          
          // Parse eNom response - safe default is unavailable
          let isAvailable = false;
          let hasError = false;
          
          if (data['interface-response']) {
            const response = data['interface-response'];
            
            // Check for errors first
            if (response.ErrCount && parseInt(response.ErrCount) > 0) {
              console.log(`eNom API error for ${cleanDomain}.${cleanTld}:`, response.errors);
              hasError = true;
              isAvailable = false; // Safe default on error
            } else if (response.RRPCode) {
              // Explicit RRP code handling
              console.log(`eNom RRPCode for ${cleanDomain}.${cleanTld}: ${response.RRPCode}`);
              if (response.RRPCode === '210') {
                isAvailable = true; // Domain is available
              } else if (response.RRPCode === '211') {
                isAvailable = false; // Domain is not available
              } else {
                // Other codes (212 = invalid, etc.) - treat as unavailable
                isAvailable = false;
              }
            } else if (response.DomainAvailable === '1') {
              isAvailable = true;
            } else if (response.DomainAvailable === '0') {
              isAvailable = false;
            }
          } else if (data.RRPCode || data.DomainAvailable) {
            // Fallback to direct response parsing
            console.log(`eNom direct response for ${cleanDomain}.${cleanTld}:`, data.RRPCode);
            if (data.RRPCode === '210' || data.DomainAvailable === '1') {
              isAvailable = true;
            } else {
              isAvailable = false;
            }
          } else {
            hasError = true;
            console.log(`Unexpected eNom response format for ${cleanDomain}.${cleanTld}`);
          }
          
          console.log(`Domain ${cleanDomain}.${cleanTld} availability: ${isAvailable}`);
          
          results.push({
            domain: `${cleanDomain}.${cleanTld}`,
            available: isAvailable,
            price: domainPricing[tld] || domainPricing[`.${cleanTld}`] || 12.99,
            tld: tld,
            premium: data.IsPremium === '1' || false
          });
        }

      } catch (error) {
        console.error('eNom API error:', error);
        // Fall back to mock data if API fails
        results = generateMockResults(cleanDomain, tlds, domainPricing);
      }
    } else {
      console.log('eNom credentials not configured, using mock data');
      // Mock data when credentials not provided
      results = generateMockResults(cleanDomain, tlds, domainPricing);
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
  console.log('WARNING: Using mock data - cannot verify actual domain availability');
  return tlds.map(tld => {
    const cleanTld = tld.replace('.', '');
    return {
      domain: `${domain}${tld}`,
      available: false, // Safe default - cannot verify availability
      price: pricing[tld] || pricing[`.${cleanTld}`] || pricing[cleanTld] || 12.99,
      tld: tld,
      premium: false
    }
  });
}

serve(handler);