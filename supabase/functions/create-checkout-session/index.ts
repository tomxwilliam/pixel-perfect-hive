import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  priceId: string;
  customerId?: string;
  mode?: 'payment' | 'subscription';
}

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

    const { priceId, customerId, mode = 'payment' }: CheckoutRequest = await req.json();

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    let stripeCustomerId = customerId;

    // If no customer ID provided, find or create Stripe customer
    if (!stripeCustomerId) {
      const customers = await stripe.customers.list({
        email: profile.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: profile.email,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          metadata: {
            supabase_user_id: user.id
          }
        });
        stripeCustomerId = customer.id;

        // Store Stripe customer ID in profile
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', user.id);
      }
    }

    const baseUrl = Deno.env.get('APP_BASE_URL') || req.headers.get('origin') || 'https://portal.404codelab.com';
    
    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancelled`,
      metadata: {
        supabase_user_id: user.id,
        price_id: priceId
      }
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in create-checkout-session function:', error);
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