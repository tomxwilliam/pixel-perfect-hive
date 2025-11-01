import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PortalRequest {
  customerId?: string;
  returnUrl?: string;
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

    const { customerId, returnUrl }: PortalRequest = await req.json();

    console.log(`User ${user.id} creating portal session with customer ID: ${customerId}`);

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
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    let stripeCustomerId = customerId;

    // SECURITY: Verify customer ID ownership if provided
    if (stripeCustomerId && profile.stripe_customer_id && stripeCustomerId !== profile.stripe_customer_id) {
      // Check if user is admin
      const { data: hasAdminRole } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      
      if (!hasAdminRole) {
        console.error(`Unauthorized: User ${user.id} attempted to access customer ${stripeCustomerId} but owns ${profile.stripe_customer_id}`);
        await supabase.rpc('log_activity', {
          p_user_id: user.id,
          p_actor_id: user.id,
          p_action: 'unauthorized_portal_attempt',
          p_entity_type: 'stripe_customer',
          p_entity_id: null,
          p_description: `Unauthorized attempt to access customer portal for ${stripeCustomerId}`
        });
        throw new Error('Forbidden: You do not have permission to access this customer portal');
      }
    }

    // If no customer ID provided, find Stripe customer
    if (!stripeCustomerId) {
      const customers = await stripe.customers.list({
        email: profile.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      } else {
        throw new Error('No Stripe customer found. Please make a purchase first.');
      }
    }

    const baseUrl = Deno.env.get('APP_BASE_URL') || req.headers.get('origin') || 'https://portal.404codelab.com';
    const defaultReturnUrl = `${baseUrl}/billing`;

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl || defaultReturnUrl,
    });

    // Log portal session creation
    await supabase.rpc('log_activity', {
      p_user_id: user.id,
      p_actor_id: user.id,
      p_action: 'portal_session_created',
      p_entity_type: 'stripe_portal',
      p_entity_id: null,
      p_description: `Customer portal session created for Stripe customer ${stripeCustomerId}`,
      p_new_values: {
        stripe_customer_id: stripeCustomerId,
        session_url: session.url
      }
    });

    console.log(`Portal session created successfully for user ${user.id}, customer ${stripeCustomerId}`);

    return new Response(JSON.stringify({ 
      url: session.url 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in create-portal-session function:', error);
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