import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CombinedCheckoutRequest {
  hostingPriceId: string;
  domain: string;
  years: number;
  id_protect?: boolean;
  nameservers?: string[];
  domainPriceGBP: number;
  idProtectPriceGBP: number;
}

// Map Stripe price IDs to WHM package names
const PLAN_MAP: Record<string, string> = {
  "price_live_starter_xxx": "STARTER_PKG",
  "price_live_pro_xxx": "PRO_PKG", 
  "price_live_elite_xxx": "ELITE_PKG",
  // Add your actual Stripe price IDs here
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is authenticated
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } }
    );

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      hostingPriceId, 
      domain, 
      years, 
      id_protect = false, 
      nameservers = ['ns1.404codelab.com', 'ns2.404codelab.com'],
      domainPriceGBP,
      idProtectPriceGBP
    }: CombinedCheckoutRequest = await req.json();

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get user profile and hosting package
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: hostingPackage } = await supabase
      .from('hosting_packages')
      .select('*')
      .eq('stripe_price_id', hostingPriceId)
      .single();

    if (!profile || !hostingPackage) {
      throw new Error('Profile or hosting package not found');
    }

    // Find or create Stripe customer
    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      const customers = await stripe.customers.list({
        email: profile.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: profile.email,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          metadata: {
            supabase_user_id: user.id
          }
        });
        stripeCustomerId = customer.id;

        await supabase
          .from('profiles')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', user.id);
      }
    }

    const baseUrl = Deno.env.get('APP_BASE_URL') || req.headers.get('origin') || 'https://portal.404codelab.com';
    
    // Calculate total domain price
    const totalDomainPrice = domainPriceGBP + (id_protect ? idProtectPriceGBP : 0);
    
    // Create line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      // Hosting subscription (recurring)
      {
        price: hostingPriceId,
        quantity: 1,
      },
      // Domain registration (one-time with auto-renewal)
      {
        price_data: {
          currency: "gbp",
          product_data: { 
            name: `Domain: ${domain} (${years}yr${id_protect ? ', ID Protect' : ''})`,
            description: `Domain registration for ${domain} with ${years} year${years > 1 ? 's' : ''} ${id_protect ? 'including ID protection' : ''}`
          },
          recurring: { 
            interval: "year",
            interval_count: years
          },
          unit_amount: Math.round(totalDomainPrice * 100) // Convert to pence
        },
        quantity: 1
      }
    ];

    // Get WHM package name
    const whmPackageName = PLAN_MAP[hostingPriceId] || hostingPackage.whm_package_name || 'DEFAULT_PKG';

    // Create order record
    const orderData = {
      customer_id: user.id,
      total_amount: hostingPackage.annual_price + totalDomainPrice,
      currency: 'GBP',
      items: [
        {
          type: 'hosting',
          package_id: hostingPackage.id,
          package_name: hostingPackage.package_name,
          price: hostingPackage.annual_price
        },
        {
          type: 'domain',
          domain: domain,
          years: years,
          id_protect: id_protect,
          nameservers: nameservers,
          price: totalDomainPrice
        }
      ],
      metadata: {
        domain,
        years,
        id_protect,
        nameservers,
        whm_package: whmPackageName,
        hosting_package_id: hostingPackage.id
      }
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancelled`,
      metadata: {
        supabase_user_id: user.id,
        order_id: order.id,
        domain,
        years: years.toString(),
        id_protect: id_protect.toString(),
        nameservers: JSON.stringify(nameservers),
        whm_package: whmPackageName,
        hosting_package_id: hostingPackage.id
      }
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      orderId: order.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in combined-checkout function:', error);
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