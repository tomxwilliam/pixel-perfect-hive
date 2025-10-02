import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DomainRegistrationRequest {
  domain: string;
  tld: string;
  price: number;
  customerId: string;
  years?: number;
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

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Check if user is admin or customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'customer')) {
      throw new Error('Unauthorized');
    }

    const registrationData: DomainRegistrationRequest = await req.json();
    
    console.log('Domain registration request:', registrationData);

    const years = registrationData.years || 1;

    // Get domain pricing from domain_tld_pricing table
    const { data: tldPricing } = await supabase
      .from('domain_tld_pricing')
      .select('registration_price')
      .eq('tld', registrationData.tld)
      .single();

    const price = registrationData.price || tldPricing?.registration_price || 12.99;
    const totalAmount = price * years;

    // Create domain record - status pending_payment awaiting Stripe payment
    const { data: domainRecord, error: domainError } = await supabase
      .from('domains')
      .insert({
        customer_id: user.id,
        domain_name: `${registrationData.domain}${registrationData.tld}`,
        tld: registrationData.tld,
        status: 'pending_payment',
        price: totalAmount,
        enom_domain_id: null, // Will be set after payment
        auto_renew: true,
        dns_management: false
      })
      .select()
      .single();

    if (domainError) {
      throw new Error(`Failed to create domain record: ${domainError.message}`);
    }

    // Create Stripe checkout session
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe not configured');
    }

    const stripe = (await import('https://esm.sh/stripe@14.21.0')).default(stripeKey);

    // Get or create Stripe customer
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let stripeCustomerId = userProfile?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userProfile?.email || user.email,
        metadata: { supabase_user_id: user.id }
      });
      stripeCustomerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `Domain Registration: ${registrationData.domain}${registrationData.tld}`,
            description: `${years} year(s) registration`
          },
          unit_amount: Math.round(totalAmount * 100), // Convert to pence
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'http://localhost:5173'}/dashboard?domain_success=true`,
      cancel_url: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'http://localhost:5173'}/dashboard?domain_cancelled=true`,
      metadata: {
        domain_id: domainRecord.id,
        customer_id: user.id,
        domain_name: `${registrationData.domain}${registrationData.tld}`,
        tld: registrationData.tld,
        years: years.toString(),
        type: 'domain_registration'
      }
    });

    // Store session ID in domain record
    await supabase
      .from('domains')
      .update({ 
        stripe_session_id: session.id
      })
      .eq('id', domainRecord.id);

    return new Response(JSON.stringify({
      success: true,
      checkout_url: session.url,
      domain: domainRecord,
      message: 'Please complete payment to register your domain'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in domain-register function:', error);
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