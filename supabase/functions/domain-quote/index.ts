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

    // Get currency conversion rates
    const { data: rateData } = await supabase
      .from('currency_rates')
      .select('rate, margin')
      .eq('from_currency', 'USD')
      .eq('to_currency', 'GBP')
      .single();

    const usdToGbpRate = rateData?.rate || 0.79;
    const margin = rateData?.margin || 0.05;

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

    // Calculate pricing
    const tld = '.' + domain.split('.').slice(1).join('.');
    const basePriceGBP = domainPricing[tld] || domainPricing['.com'] || 12.99;
    
    // Domain price for multiple years
    const totalDomainPrice = basePriceGBP * years;
    
    // ID Protection price (typically $9.95/year in USD, convert to GBP)
    const idProtectPriceUSD = 9.95;
    const idProtectPriceGBP = id_protect ? (idProtectPriceUSD * usdToGbpRate * (1 + margin) * years) : 0;
    
    // Total price
    const totalGBP = totalDomainPrice + idProtectPriceGBP;

    const result: DomainQuoteResponse = {
      available: isAvailable,
      domain,
      years,
      domainPrice: totalDomainPrice,
      idProtectPrice: idProtectPriceGBP,
      totalGBP: Math.round(totalGBP * 100) / 100, // Round to 2 decimal places
      currency: 'GBP'
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