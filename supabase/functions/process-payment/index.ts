import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  invoiceId: string;
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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { invoiceId }: PaymentRequest = await req.json();

    console.log(`Processing payment for invoice: ${invoiceId}`);

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        profiles!invoices_customer_id_fkey(first_name, last_name, email)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'paid') {
      throw new Error('Invoice already paid');
    }

    // Ensure caller owns the invoice unless admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const isAdmin = profile?.role === 'admin';
    if (!isAdmin && invoice.customer_id !== user.id) {
      throw new Error('Forbidden');
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({
      email: invoice.profiles.email,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: invoice.profiles.email,
        name: `${invoice.profiles.first_name} ${invoice.profiles.last_name}`,
        metadata: {
          supabase_user_id: invoice.customer_id
        }
      });
      customerId = customer.id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Invoice ${invoice.invoice_number}`,
              description: `Payment for invoice ${invoice.invoice_number}`
            },
            unit_amount: Math.round(invoice.amount * 100) // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&invoice=${invoiceId}`,
      cancel_url: `${req.headers.get('origin')}/dashboard?payment=cancelled&invoice=${invoiceId}`,
      metadata: {
        invoice_id: invoiceId,
        supabase_user_id: invoice.customer_id
      }
    });

    // Update invoice with Stripe session ID (payment intent will be updated by webhook)
    await supabase
      .from('invoices')
      .update({ 
        stripe_session_id: session.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId);

    console.log(`Updated invoice ${invoiceId} with session ID: ${session.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      checkoutUrl: session.url,
      sessionId: session.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in process-payment function:', error);
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