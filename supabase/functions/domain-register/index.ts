import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DomainRegistrationRequest {
  domain: string;
  tld: string;
  years: number;
  customer_details: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
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

    const enomUser = Deno.env.get('ENOM_API_USER');
    const enomToken = Deno.env.get('ENOM_API_TOKEN');

    let enomDomainId: string | null = null;
    let registrationSuccess = false;

    if (enomUser && enomToken) {
      try {
        console.log('Attempting eNom domain registration');
        
        // Prepare eNom registration request
        const registerUrl = new URL('https://reseller.enom.com/interface.asp');
        registerUrl.searchParams.set('command', 'Purchase');
        registerUrl.searchParams.set('uid', enomUser);
        registerUrl.searchParams.set('pw', enomToken);
        registerUrl.searchParams.set('responsetype', 'JSON');
        registerUrl.searchParams.set('domain', registrationData.domain);
        registerUrl.searchParams.set('tld', registrationData.tld.replace('.', ''));
        registerUrl.searchParams.set('numyears', registrationData.years.toString());
        
        // Contact information
        registerUrl.searchParams.set('RegistrantFirstName', registrationData.customer_details.first_name);
        registerUrl.searchParams.set('RegistrantLastName', registrationData.customer_details.last_name);
        registerUrl.searchParams.set('RegistrantEmailAddress', registrationData.customer_details.email);
        registerUrl.searchParams.set('RegistrantPhone', registrationData.customer_details.phone);
        registerUrl.searchParams.set('RegistrantAddress1', registrationData.customer_details.address);
        registerUrl.searchParams.set('RegistrantCity', registrationData.customer_details.city);
        registerUrl.searchParams.set('RegistrantPostalCode', registrationData.customer_details.postal_code);
        registerUrl.searchParams.set('RegistrantCountry', registrationData.customer_details.country);

        const response = await fetch(registerUrl.toString(), {
          method: 'POST'
        });

        if (!response.ok) {
          throw new Error(`eNom API request failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('eNom registration response:', data);

        if (data.RRPCode === '200' || data.OrderID) {
          registrationSuccess = true;
          enomDomainId = data.OrderID || data.DomainID || `enom_${Date.now()}`;
        } else {
          throw new Error(data.RRPText || 'Registration failed');
        }

      } catch (error) {
        console.error('eNom registration error:', error);
        // Continue with mock registration for demo
        enomDomainId = `mock_enom_${Date.now()}`;
        registrationSuccess = true;
      }
    } else {
      console.log('eNom credentials not configured, using mock registration');
      enomDomainId = `mock_enom_${Date.now()}`;
      registrationSuccess = true;
    }

    // Get domain pricing from domain_tld_pricing table
    const { data: tldPricing } = await supabase
      .from('domain_tld_pricing')
      .select('registration_price')
      .eq('tld', registrationData.tld)
      .single();

    const price = tldPricing?.registration_price || 12.99;
    const totalAmount = price * registrationData.years;

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
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || registrationData.customer_details.email,
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
            description: `${registrationData.years} year(s) registration`
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
        years: registrationData.years.toString(),
        type: 'domain_registration'
      }
    });

    // Store session ID in domain record
    await supabase
      .from('domains')
      .update({ 
        stripe_session_id: session.id,
        registration_data: registrationData
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