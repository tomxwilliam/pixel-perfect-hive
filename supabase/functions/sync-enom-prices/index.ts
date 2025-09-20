import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnomPriceResponse {
  TLD: string;
  Price: string;
  RenewalPrice: string;
  TransferPrice: string;
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

    console.log('Starting domain pricing sync from Enom...');

    // Get environment variables
    const enomUser = Deno.env.get('ENOM_API_USER');
    const enomToken = Deno.env.get('ENOM_API_TOKEN');
    const enomBase = Deno.env.get('ENOM_API_BASE') || 'https://reseller.enom.com';
    const exchangeApiKey = Deno.env.get('EXCHANGE_RATE_API');
    const defaultCurrency = Deno.env.get('DEFAULT_CURRENCY') || 'GBP';
    const fxBase = Deno.env.get('FX_BASE') || 'USD';
    const fxCacheHours = parseInt(Deno.env.get('FX_CACHE_HOURS') || '24');

    if (!enomUser || !enomToken) {
      throw new Error('Enom API credentials not configured');
    }

    // 1. Update exchange rate if needed
    let exchangeRate = 0.79; // Default fallback
    if (exchangeApiKey) {
      try {
        const { data: existingRate } = await supabase
          .from('exchange_rates')
          .select('*')
          .eq('from_currency', fxBase)
          .eq('to_currency', defaultCurrency)
          .single();

        const shouldRefresh = !existingRate || 
          new Date(existingRate.expires_at) < new Date();

        if (shouldRefresh) {
          console.log('Fetching fresh exchange rate...');
          const fxResponse = await fetch(
            `https://v6.exchangerate-api.com/v6/${exchangeApiKey}/latest/${fxBase}`
          );
          
          if (fxResponse.ok) {
            const fxData = await fxResponse.json();
            exchangeRate = fxData.conversion_rates[defaultCurrency];
            
            // Update cache
            await supabase
              .from('exchange_rates')
              .upsert({
                from_currency: fxBase,
                to_currency: defaultCurrency,
                rate: exchangeRate,
                cached_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + fxCacheHours * 60 * 60 * 1000).toISOString(),
                source: 'exchange_api'
              });
            
            console.log(`Updated exchange rate: 1 ${fxBase} = ${exchangeRate} ${defaultCurrency}`);
          }
        } else {
          exchangeRate = existingRate.rate;
          console.log(`Using cached exchange rate: ${exchangeRate}`);
        }
      } catch (error) {
        console.error('Exchange rate fetch failed, using fallback:', error);
      }
    }

    // 2. Get domain pricing from Enom
    const supportedTlds = ['.com', '.net', '.org', '.co.uk', '.uk', '.info', '.biz', '.us'];
    const updatedPrices = [];

    for (const tld of supportedTlds) {
      try {
        console.log(`Fetching pricing for ${tld}...`);
        
        const cleanTld = tld.replace('.', '');
        const enomUrl = new URL(`${enomBase}/interface.asp`);
        enomUrl.searchParams.set('command', 'PE_GetPricing');
        enomUrl.searchParams.set('uid', enomUser);
        enomUrl.searchParams.set('pw', enomToken);
        enomUrl.searchParams.set('responsetype', 'JSON');
        enomUrl.searchParams.set('tld', cleanTld);

        const response = await fetch(enomUrl.toString());
        
        if (response.ok) {
          const data = await response.json();
          
          if (data['interface-response']) {
            const enomResponse = data['interface-response'];
            
            if (enomResponse.ErrCount && parseInt(enomResponse.ErrCount) === 0) {
              // Extract pricing data - eNom typically returns register, renew, transfer prices
              const priceData = enomResponse.pricing || enomResponse;
              
              // Get different pricing tiers (register, renew, transfer)
              const registerPriceUSD = parseFloat(priceData.registerPrice || priceData.Price || '12.99');
              const renewPriceUSD = parseFloat(priceData.renewPrice || priceData.RenewalPrice || registerPriceUSD);
              const transferPriceUSD = parseFloat(priceData.transferPrice || priceData.TransferPrice || registerPriceUSD);
              
              // Convert all prices to GBP
              const registerPriceGBP = Math.round((registerPriceUSD * exchangeRate + 0.01) * 100) / 100;
              const renewPriceGBP = Math.round((renewPriceUSD * exchangeRate + 0.01) * 100) / 100;
              const transferPriceGBP = Math.round((transferPriceUSD * exchangeRate + 0.01) * 100) / 100;
              const idProtectPriceGBP = Math.round((9.95 * exchangeRate + 0.01) * 100) / 100;

              // Check if we have an override for this TLD
              const { data: existingPrice } = await supabase
                .from('domain_prices')
                .select('*')
                .eq('tld', tld)
                .single();

              // Only update if not overridden by admin
              if (!existingPrice?.is_override) {
                await supabase
                  .from('domain_prices')
                  .upsert({
                    tld,
                    retail_usd: registerPriceUSD, // Keep for backward compatibility
                    retail_gbp: registerPriceGBP, // Keep for backward compatibility
                    register_price_usd: registerPriceUSD,
                    register_price_gbp: registerPriceGBP,
                    renew_price_usd: renewPriceUSD,
                    renew_price_gbp: renewPriceGBP,
                    transfer_price_usd: transferPriceUSD,
                    transfer_price_gbp: transferPriceGBP,
                    id_protect_usd: 9.95,
                    id_protect_gbp: idProtectPriceGBP,
                    margin_percent: 0.05,
                    source: 'enom',
                    is_override: false,
                    last_synced_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });

                updatedPrices.push({
                  tld,
                  register_usd: registerPriceUSD,
                  register_gbp: registerPriceGBP,
                  renew_usd: renewPriceUSD,
                  renew_gbp: renewPriceGBP,
                  transfer_usd: transferPriceUSD,
                  transfer_gbp: transferPriceGBP,
                  updated: true
                });

                console.log(`Updated ${tld}: Register $${registerPriceUSD}→£${registerPriceGBP}, Renew $${renewPriceUSD}→£${renewPriceGBP}, Transfer $${transferPriceUSD}→£${transferPriceGBP}`);
              } else {
                console.log(`Skipped ${tld}: admin override in place`);
                updatedPrices.push({
                  tld,
                  retail_gbp: existingPrice.retail_gbp,
                  updated: false,
                  reason: 'admin_override'
                });
              }
            } else {
              console.log(`Enom API error for ${tld}:`, enomResponse.errors);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to fetch pricing for ${tld}:`, error);
      }
    }

    // 3. Log sync activity
    console.log(`Domain pricing sync completed. Updated ${updatedPrices.filter(p => p.updated).length} TLDs`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Domain pricing sync completed',
      exchange_rate: exchangeRate,
      updated_count: updatedPrices.filter(p => p.updated).length,
      total_checked: supportedTlds.length,
      details: updatedPrices,
      synced_at: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in sync-enom-prices function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false,
        synced_at: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);