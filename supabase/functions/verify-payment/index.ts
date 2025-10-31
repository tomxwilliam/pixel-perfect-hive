import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentStatusRequest {
  sessionId: string;
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

    const { sessionId }: PaymentStatusRequest = await req.json();

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Retry logic with exponential backoff
    let session;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelays = [0, 2000, 4000, 8000]; // 0s, 2s, 4s, 8s

    while (retryCount <= maxRetries) {
      if (retryCount > 0) {
        console.log(`Retry attempt ${retryCount}/${maxRetries} after ${retryDelays[retryCount]}ms delay`);
        await new Promise(resolve => setTimeout(resolve, retryDelays[retryCount]));
      }

      // Retrieve checkout session
      session = await stripe.checkout.sessions.retrieve(sessionId);

      console.log(`Session retrieved (attempt ${retryCount + 1}):`, {
        id: session.id,
        payment_status: session.payment_status,
        metadata: session.metadata
      });

      if (session.payment_status === 'paid') {
        break;
      }

      retryCount++;
    }

    if (session.payment_status === 'paid') {
      const invoiceId = session.metadata?.invoice_id;
      
      if (!invoiceId) {
        console.error('No invoice_id in session metadata');
        throw new Error('Invoice ID not found in session metadata');
      }

      console.log('Processing payment for invoice:', invoiceId);
      
      // Update invoice status
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (invoiceError) {
        console.error('Error updating invoice:', invoiceError);
        throw invoiceError;
      }

      console.log('Invoice updated successfully:', invoiceId);

      // Check if this is for a domain or hosting service
      const { data: invoice } = await supabase
        .from('invoices')
        .select(`
          *,
          domains!domains_invoice_id_fkey(*),
          hosting_subscriptions!hosting_subscriptions_invoice_id_fkey(*)
        `)
        .eq('id', invoiceId)
        .single();

      // Trigger provisioning if needed
      if (invoice?.domains?.[0]) {
        // Domain paid - trigger domain registration
        await supabase.functions.invoke('domain-register', {
          body: {
            domainId: invoice.domains[0].id,
            action: 'activate'
          }
        });
      }

      if (invoice?.hosting_subscriptions?.[0]) {
        // Hosting paid - trigger hosting provisioning
        await supabase.functions.invoke('hosting-provision', {
          body: {
            subscriptionId: invoice.hosting_subscriptions[0].id,
            action: 'create'
          }
        });
      }

      // Send payment confirmation notification
      await supabase.rpc('send_notification', {
        p_user_id: session.metadata?.supabase_user_id,
        p_title: 'Payment Successful',
        p_message: `Your payment for invoice ${invoice?.invoice_number} has been processed successfully.`,
        p_type: 'success',
        p_category: 'billing',
        p_related_id: invoiceId
      });

      // Log activity
      await supabase.rpc('log_activity', {
        p_user_id: session.metadata?.supabase_user_id,
        p_actor_id: session.metadata?.supabase_user_id,
        p_action: 'payment_completed',
        p_entity_type: 'invoice',
        p_entity_id: invoiceId,
        p_description: `Payment completed for invoice ${invoice?.invoice_number}`
      });
    }

    console.log('Returning response with status:', session.payment_status);

    return new Response(JSON.stringify({
      success: true, 
      paymentStatus: session.payment_status,
      paymentIntent: session.payment_intent
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in verify-payment function:', error);
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