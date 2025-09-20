import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DomainQuoteRequest {
  domain: string;
  years: number;
  id_protect?: boolean;
}

interface DomainQuoteResponse {
  available: boolean;
  domain: string;
  years: number;
  domainPrice: number;
  idProtectPrice: number;
  totalGBP: number;
  currency: string;
  updatedAt?: string;
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

    const { domain, years = 1, id_protect = false }: DomainQuoteRequest = await req.json();

    console.log(`Getting quote for: ${domain} (${years} years, ID Protect: ${id_protect})`);

    // Get domain pricing from new pricing table
    const tld = '.' + domain.split('.').slice(1).join('.');
    
    let { data: priceData } = await supabase
      .from('domain_prices')
      .select('*')
      .eq('tld', tld)
      .single();

    // If no specific pricing found, try to refresh from sync if stale
    if (!priceData || new Date(priceData.last_synced_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      console.log(`Pricing for ${tld} is stale or missing, attempting refresh...`);
      
      try {
        await supabase.functions.invoke('sync-enom-prices');
        
        // Try to get updated pricing
        const { data: refreshedPrice } = await supabase
          .from('domain_prices')
          .select('*')
          .eq('tld', tld)
          .single();
          
        if (refreshedPrice) {
          priceData = refreshedPrice;
        }
      } catch (error) {
        console.error('Failed to refresh pricing:', error);
      }
    }

    // Fallback to default pricing if still no data
    const basePriceGBP = priceData?.retail_gbp || 12.99;
    const idProtectPriceGBP = priceData?.id_protect_gbp || 7.99;

    const enomUser = Deno.env.get('ENOM_API_USER');
    const enomToken = Deno.env.get('ENOM_API_TOKEN');

    let isAvailable = true;
    let domainPriceUSD = 12.99; // Default fallback

    // Check availability with eNom if configured
    if (enomUser && enomToken) {
      try {
        const domainParts = domain.split('.');
        const sld = domainParts[0];
        const tld = domainParts.slice(1).join('.');

        const searchUrl = new URL('https://reseller.enom.com/interface.asp');
        searchUrl.searchParams.set('command', 'Check');
        searchUrl.searchParams.set('uid', enomUser);
        searchUrl.searchParams.set('pw', enomToken);
        searchUrl.searchParams.set('responsetype', 'JSON');
        searchUrl.searchParams.set('domain', sld);
        searchUrl.searchParams.set('tld', tld);

        const response = await fetch(searchUrl.toString());
        if (response.ok) {
          const data = await response.json();
          
          if (data['interface-response']) {
            const enomResponse = data['interface-response'];
            if (enomResponse.ErrCount && parseInt(enomResponse.ErrCount) > 0) {
              console.log('eNom API error:', enomResponse.errors);
              isAvailable = true; // Default to available on API error
            } else {
              isAvailable = enomResponse.RRPCode === '210' || enomResponse.DomainAvailable === '1';
            }
          }
        }
      } catch (error) {
        console.error('eNom availability check failed:', error);
        isAvailable = true; // Default to available on API error
      }
    }

    // Calculate pricing using new pricing data
    const totalDomainPrice = basePriceGBP * years;
    const totalIdProtectPrice = id_protect ? (idProtectPriceGBP * years) : 0;
    const totalGBP = totalDomainPrice + totalIdProtectPrice;

    const result: DomainQuoteResponse = {
      available: isAvailable,
      domain,
      years,
      domainPrice: totalDomainPrice,
      idProtectPrice: totalIdProtectPrice,
      totalGBP: Math.round(totalGBP * 100) / 100, // Round to 2 decimal places
      currency: 'GBP',
      updatedAt: priceData?.last_synced_at || new Date().toISOString()
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in domain-quote function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);