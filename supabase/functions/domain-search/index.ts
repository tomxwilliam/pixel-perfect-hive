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

    const proxyUrl = Deno.env.get('DOMAIN_PROXY_URL');
    const proxyApiKey = Deno.env.get('DOMAIN_PROXY_API_KEY');

    let results: DomainResult[] = [];

    if (proxyUrl && proxyApiKey) {
      // Use proxy server for eNom API calls
      try {
        console.log('Using proxy server for domain search');
        
        // Check each domain through the proxy
        for (const tld of tlds) {
          const cleanTld = tld.replace('.', '');
          
          const response = await fetch(`${proxyUrl}/check-domain`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': proxyApiKey,
            },
            body: JSON.stringify({
              domain: cleanDomain,
              tld: cleanTld,
            }),
          });

          if (!response.ok) {
            throw new Error(`Proxy request failed: ${response.status}`);
          }

          const data = await response.json();
          console.log(`Proxy response for ${cleanDomain}.${cleanTld}:`, data);

          // Handle proxy errors
          if (data.error) {
            console.error(`Proxy error for ${cleanDomain}.${cleanTld}:`, data.errorMessage);
            // Fall back to unavailable on error
            results.push({
              domain: `${cleanDomain}.${cleanTld}`,
              available: false,
              price: domainPricing[tld] || domainPricing[`.${cleanTld}`] || 12.99,
              tld: tld,
              premium: false
            });
          } else {
            // Use proxy result
            results.push({
              domain: data.domain,
              available: data.available,
              price: domainPricing[tld] || domainPricing[`.${cleanTld}`] || 12.99,
              tld: tld,
              premium: data.premium || false
            });
          }
        }

      } catch (error) {
        console.error('Proxy server error:', error);
        // Fall back to mock data if proxy fails
        results = generateMockResults(cleanDomain, tlds, domainPricing);
      }
    } else {
      console.log('Proxy not configured, using mock data');
      // Mock data when proxy not configured
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