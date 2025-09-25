import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnomPriceResponse {
  interface_response?: {
    price?: string;
    productprice?: string;
    retailprice?: string;
    yourprice?: string;
  };
}

// TLD categorization
function categorizeTld(tld: string): "gTLD" | "ccTLD" | "sTLD" {
  const sTLDs = new Set([".aero", ".asia", ".cat", ".int", ".jobs", ".museum", ".travel"]);
  if (sTLDs.has(tld)) return "sTLD";
  const core = tld.replace(/^\./, "");
  return /^[a-z]{2}$/i.test(core) ? "ccTLD" : "gTLD";
}

// Convert USD to GBP
function toGBP(usd?: number | string | null, rate = 0.7397): number | null {
  if (usd == null) return null;
  const n = typeof usd === "string" ? Number(usd) : usd;
  if (Number.isNaN(n)) return null;
  return Math.round(n * rate * 100) / 100;
}

// Get TLD list from eNom
async function getAllTlds(): Promise<string[]> {
  const params = new URLSearchParams({
    command: 'GetTLDList',
    uid: Deno.env.get('ENOM_API_USER') || '',
    pw: Deno.env.get('ENOM_API_TOKEN') || '',
    responsetype: 'xml'
  });

  const response = await fetch(`https://reseller.enom.com/interface.asp?${params.toString()}`);
  const xmlText = await response.text();
  
  // Simple XML parsing for TLD list
  const tldMatches = xmlText.match(/<tld>([^<]+)<\/tld>/g);
  if (!tldMatches) return [];
  
  return tldMatches.map(match => {
    const tld = match.replace(/<\/?tld>/g, '');
    return tld.startsWith('.') ? tld : `.${tld}`;
  });
}

// Get price from eNom API
async function getPriceUSD(tld: string, years: number | null, kind: "register" | "renew" | "transfer"): Promise<number | null> {
  const commandMap = { 
    register: "RegisterDomain", 
    renew: "RenewDomain", 
    transfer: "TransferDomain" 
  };
  
  const params = new URLSearchParams({
    command: 'PE_GetProductPrice',
    uid: Deno.env.get('ENOM_API_USER') || '',
    pw: Deno.env.get('ENOM_API_TOKEN') || '',
    responsetype: 'xml',
    ProductType: commandMap[kind],
    tld: tld.replace(/^\./, '')
  });

  if (kind !== "transfer" && years) {
    params.set('years', years.toString());
  }

  try {
    const response = await fetch(`https://reseller.enom.com/interface.asp?${params.toString()}`);
    const xmlText = await response.text();
    
    // Extract price from XML response
    const priceMatch = xmlText.match(/<(?:price|productprice|retailprice|yourprice)>([^<]+)<\/(?:price|productprice|retailprice|yourprice)>/);
    if (priceMatch && priceMatch[1]) {
      const price = Number(priceMatch[1]);
      return isNaN(price) ? null : price;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting price for ${tld} (${kind}, ${years}y):`, error);
    return null;
  }
}

// Get all prices for a TLD
async function getPricesForTld(tld: string) {
  const years = [1, 2, 5, 10];
  const regUSD: Record<number, number | null> = { 1: null, 2: null, 5: null, 10: null };
  
  // Get registration prices for different years
  for (const year of years) {
    regUSD[year] = await getPriceUSD(tld, year, "register");
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Get renewal and transfer prices
  const renew1USD = await getPriceUSD(tld, 1, "renew");
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const transferUSD = await getPriceUSD(tld, 1, "transfer");
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    tld,
    category: categorizeTld(tld),
    regUSD,
    renew1USD,
    transferUSD: transferUSD ?? renew1USD, // Fall back to renewal price if transfer not available
    regGBP: {
      1: toGBP(regUSD[1]),
      2: toGBP(regUSD[2]),
      5: toGBP(regUSD[5]),
      10: toGBP(regUSD[10]),
    },
    renew1GBP: toGBP(renew1USD),
    transferGBP: toGBP(transferUSD ?? renew1USD),
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting eNom domain pricing sync...');

    // Get all TLDs from eNom
    const tlds = await getAllTlds();
    console.log(`Found ${tlds.length} TLDs to sync`);

    let successCount = 0;
    let errorCount = 0;

    // Process TLDs in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < tlds.length; i += batchSize) {
      const batch = tlds.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (tld) => {
        try {
          console.log(`Processing ${tld}...`);
          const pricing = await getPricesForTld(tld);

          // Insert or update the pricing data
          const { error } = await supabase
            .from('domain_tld_pricing')
            .upsert({
              tld: pricing.tld,
              category: pricing.category,
              reg_1y_gbp: pricing.regGBP[1],
              reg_2y_gbp: pricing.regGBP[2],
              reg_5y_gbp: pricing.regGBP[5],
              reg_10y_gbp: pricing.regGBP[10],
              renew_1y_gbp: pricing.renew1GBP,
              transfer_1y_gbp: pricing.transferGBP,
              reg_1y_usd: pricing.regUSD[1],
              reg_2y_usd: pricing.regUSD[2],
              reg_5y_usd: pricing.regUSD[5],
              reg_10y_usd: pricing.regUSD[10],
              renew_1y_usd: pricing.renew1USD,
              transfer_1y_usd: pricing.transferUSD,
              usd_to_gbp_rate: 0.7397,
              source: 'enom_api',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'tld'
            });

          if (error) {
            console.error(`Error saving pricing for ${tld}:`, error);
            errorCount++;
          } else {
            console.log(`Successfully synced ${tld}`);
            successCount++;
          }
        } catch (error) {
          console.error(`Error processing ${tld}:`, error);
          errorCount++;
        }
      }));

      // Add delay between batches
      if (i + batchSize < tlds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Sync completed. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({ 
      success: true, 
      total: tlds.length,
      synced: successCount,
      errors: errorCount,
      message: `Successfully synced ${successCount} TLDs with ${errorCount} errors`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);