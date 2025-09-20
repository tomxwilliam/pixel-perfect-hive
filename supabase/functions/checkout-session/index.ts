import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  hostingPriceId?: string;
  domain?: string;
  years?: number;
  id_protect?: boolean;
  nameservers?: string[];
  successUrl?: string;
  cancelUrl?: string;
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

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    const { 
      hostingPriceId, 
      domain, 
      years = 1, 
      id_protect = false, 
      nameservers,
      successUrl = `${req.headers.get('origin')}/dashboard`,
      cancelUrl = `${req.headers.get('origin')}/hosting-domain`
    }: CheckoutRequest = await req.json();

    console.log('Creating checkout session for:', { hostingPriceId, domain, years, id_protect });

    // Get user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get user profile for Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id;

    // Create Stripe customer if needed
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
        metadata: {
          supabase_user_id: user.id
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Update profile with Stripe customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    const lineItems: any[] = [];
    let metadata: any = {
      customer_id: user.id,
      type: 'hosting_domain_order'
    };

    // Add hosting package if specified
    if (hostingPriceId) {
      const { data: hostingPackage } = await supabase
        .from('hosting_packages')
        .select('*')
        .eq('stripe_price_id', hostingPriceId)
        .single();

      if (hostingPackage) {
        lineItems.push({
          price: hostingPriceId,
          quantity: 1,
        });

        metadata.hosting_package_id = hostingPackage.id;
        metadata.whm_package = hostingPackage.whm_package_name;
      }
    }

    // Add domain if specified
    if (domain) {
      // Get domain quote for pricing
      const { data: quoteResponse } = await supabase.functions.invoke('domain-quote', {
        body: { domain, years, id_protect }
      });

      if (quoteResponse && quoteResponse.available) {
        const tld = '.' + domain.split('.').slice(1).join('.');
        
        // Create one-time price for domain
        const domainPrice = await stripe.prices.create({
          currency: 'gbp',
          unit_amount: Math.round(quoteResponse.totalGBP * 100),
          product_data: {
            name: `Domain Registration: ${domain} (${years} year${years > 1 ? 's' : ''})`,
            description: `Domain registration for ${domain}${id_protect ? ' with ID Protection' : ''}`,
          },
        });

        lineItems.push({
          price: domainPrice.id,
          quantity: 1,
        });

        metadata.domain = domain;
        metadata.tld = tld;
        metadata.years = years;
        metadata.id_protect = id_protect;
        metadata.price_locked_gbp = quoteResponse.totalGBP;
        
        // Use provided nameservers or get defaults
        if (nameservers && nameservers.length > 0) {
          metadata.nameservers = JSON.stringify(nameservers);
        } else {
          const { data: settings } = await supabase
            .from('domain_hosting_settings')
            .select('default_nameservers')
            .single();
          
          if (settings?.default_nameservers) {
            metadata.nameservers = JSON.stringify(settings.default_nameservers);
          }
        }
      } else {
        throw new Error('Domain not available or pricing unavailable');
      }
    }

    if (lineItems.length === 0) {
      throw new Error('No items to checkout');
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: hostingPriceId ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      billing_address_collection: 'required',
      customer_update: {
        name: 'auto',
        address: 'auto',
      },
    });

    console.log('Created checkout session:', session.id);

    return new Response(JSON.stringify({
      sessionId: session.id,
      url: session.url
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
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