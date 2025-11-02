import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import Stripe from "https://esm.sh/stripe@14.21.0";
import { z } from 'https://esm.sh/zod@3.23.8';
import { handleDomainRegistrationPayment } from './_handlers/domain-registration.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// Schema for validating webhook metadata to prevent injection attacks
const webhookMetadataSchema = z.object({
  order_id: z.string().uuid('Invalid order ID format'),
  domain: z.string()
    .regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, 'Invalid domain format')
    .max(253, 'Domain name too long'),
  years: z.number().int().min(1).max(10, 'Registration must be 1-10 years'),
  id_protect: z.boolean().optional().default(false),
  nameservers: z.array(
    z.string().regex(/^[a-z0-9.-]+$/i, 'Invalid nameserver format')
  ).min(2).max(4, 'Must provide 2-4 nameservers'),
  supabase_user_id: z.string().uuid('Invalid user ID')
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey || !webhookSecret) {
      throw new Error('Stripe configuration missing');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return new Response('No signature', { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log(`Processing webhook: ${event.type} (${event.id})`);

    // Check if event already processed
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`);
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Log the event
    await supabase
      .from('webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type
      });

    // Process the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Check if this is a domain registration payment
        if (session.metadata?.type === 'domain_registration') {
          await handleDomainRegistrationPayment(supabase, session);
        } else {
          await handleCheckoutCompleted(supabase, session);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(supabase, invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(supabase, invoice);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(supabase, subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(supabase, paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(supabase, paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(supabase, charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in stripe-webhook function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

// Handle checkout.session.completed
async function handleCheckoutCompleted(supabase: any, session: Stripe.Checkout.Session) {
  console.log(`Processing checkout completion: ${session.id}`);
  
  const invoiceId = session.metadata?.invoice_id;
  const orderId = session.metadata?.order_id;
  
  // Handle invoice payments
  if (invoiceId) {
    console.log(`Processing invoice payment for invoice ${invoiceId}`);
    console.log(`Session payment status: ${session.payment_status}`);
    console.log(`Session payment intent: ${session.payment_intent}`);
    
    const updateData: any = {
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_session_id: session.id,
      updated_at: new Date().toISOString()
    };

    // Only mark as paid if payment status is 'paid'
    if (session.payment_status === 'paid') {
      updateData.status = 'paid';
      updateData.paid_at = new Date().toISOString();
      console.log(`Marking invoice ${invoiceId} as paid`);
    }

    const { error: updateError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId);

    if (updateError) {
      console.error(`Error updating invoice ${invoiceId}:`, updateError);
      throw updateError;
    }
    
    console.log(`Invoice ${invoiceId} updated successfully with payment_status: ${session.payment_status}`);

    // Send notification to customer if payment succeeded
    if (session.payment_status === 'paid' && session.metadata?.supabase_user_id) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('id', invoiceId)
        .single();

      await supabase.rpc('send_notification', {
        p_user_id: session.metadata.supabase_user_id,
        p_title: 'Payment Successful',
        p_message: `Your payment for invoice ${invoice?.invoice_number} has been processed successfully.`,
        p_type: 'success',
        p_category: 'billing',
        p_related_id: invoiceId
      });
    }
  }
  
  // Handle new combined domain orders
  if (orderId) {
    await processDomainOrder(supabase, session);
  }
}

// Handle invoice.payment_succeeded
async function handleInvoicePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  console.log(`Invoice payment succeeded: ${invoice.id}`);
  
  if (invoice.subscription) {
    // Handle subscription renewals - domain registration only
    const metadata = invoice.metadata || {};
    if (metadata.domain && metadata.order_id) {
      await processDomainOrder(supabase, {
        metadata,
        payment_intent: invoice.payment_intent,
        customer: invoice.customer
      } as any);
    }
  }
}

// Handle invoice.payment_failed
async function handleInvoicePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  console.log(`Invoice payment failed: ${invoice.id}`);
  // Note: Hosting suspension handled externally via WHM admin interface
}

// Handle subscription events
async function handleSubscriptionCreated(supabase: any, subscription: Stripe.Subscription) {
  console.log(`Subscription created: ${subscription.id}`);
}

async function handleSubscriptionUpdated(supabase: any, subscription: Stripe.Subscription) {
  console.log(`Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  console.log(`Subscription deleted: ${subscription.id}`);
  await suspendHostingServices(supabase, subscription.customer as string, 'subscription_cancelled');
}

// Handle payment intent events
async function handlePaymentIntentSucceeded(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);
}

async function handlePaymentIntentFailed(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment failed: ${paymentIntent.id}`);
}

async function handleChargeRefunded(supabase: any, charge: Stripe.Charge) {
  console.log(`Charge refunded: ${charge.id}`);
  // Note: Hosting account management handled externally via WHM
}

// Process domain order after successful payment (hosting credentials removed for security)
async function processDomainOrder(supabase: any, session: any) {
  try {
    // STEP 1: VALIDATE METADATA to prevent injection attacks
    const validationResult = webhookMetadataSchema.safeParse({
      order_id: session.metadata?.order_id,
      domain: session.metadata?.domain,
      years: parseInt(session.metadata?.years || '1'),
      id_protect: session.metadata?.id_protect === 'true',
      nameservers: JSON.parse(session.metadata?.nameservers || '["ns1.404codelab.com", "ns2.404codelab.com"]'),
      supabase_user_id: session.metadata?.supabase_user_id
    });

    if (!validationResult.success) {
      console.error('⚠️ INVALID WEBHOOK METADATA DETECTED:', validationResult.error);
      throw new Error(`Metadata validation failed: ${validationResult.error.message}`);
    }

    const validated = validationResult.data;
    console.log(`✅ Metadata validated for order ${validated.order_id}`);

    // STEP 2: VERIFY ORDER OWNERSHIP to prevent order hijacking
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('customer_id, status, total_amount')
      .eq('id', validated.order_id)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    if (order.customer_id !== validated.supabase_user_id) {
      console.error('⚠️ ORDER HIJACKING ATTEMPT DETECTED!');
      console.error(`Order ${validated.order_id} belongs to ${order.customer_id}, not ${validated.supabase_user_id}`);
      throw new Error('Order does not belong to specified user');
    }

    if (order.status !== 'pending') {
      console.log(`Order ${validated.order_id} status is ${order.status}, skipping processing`);
      return;
    }

    console.log(`Processing order ${validated.order_id} for domain ${validated.domain}`);

    // STEP 3: Update order status with validated data
    await supabase
      .from('orders')
      .update({
        status: 'processing',
        stripe_payment_intent_id: session.payment_intent,
        completed_at: new Date().toISOString()
      })
      .eq('id', validated.order_id);

    // STEP 4: Register domain with validated values
    await registerDomainWithEnom(
      supabase, 
      validated.domain, 
      validated.years, 
      validated.id_protect, 
      validated.nameservers, 
      validated.order_id, 
      validated.supabase_user_id
    );

    // STEP 5: Mark order as completed
    await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', validated.order_id);

    console.log(`✅ Successfully registered domain ${validated.domain}`);
    
    // Note: Hosting credentials are managed externally via WHM/cPanel admin interface
    // Customers should contact support for hosting access details
  } catch (error) {
    console.error('Error processing domain order:', error);
    
    if (session.metadata?.order_id) {
      await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', session.metadata.order_id);
    }
    throw error;
  }
}

// Register domain with eNom
async function registerDomainWithEnom(
  supabase: any, 
  domain: string, 
  years: number, 
  idProtect: boolean, 
  nameservers: string[], 
  orderId: string, 
  userId: string
) {
  const enomUser = Deno.env.get('ENOM_API_USER');
  const enomToken = Deno.env.get('ENOM_API_TOKEN');

  if (!enomUser || !enomToken) {
    console.warn('eNom credentials not configured, creating mock domain registration');
    
    // Create mock domain registration record
    const { data: domainReg, error } = await supabase
      .from('domain_registrations')
      .insert({
        order_id: orderId,
        customer_id: userId,
        domain_name: domain,
        tld: '.' + domain.split('.').slice(1).join('.'),
        years: years,
        id_protect: idProtect,
        nameservers: nameservers,
        status: 'active',
        registration_date: new Date().toISOString(),
        expiry_date: new Date(Date.now() + years * 365 * 24 * 60 * 60 * 1000).toISOString(),
        enom_order_id: `mock_${Date.now()}`,
        price: 12.99 * years,
        currency: 'GBP'
      })
      .select()
      .single();

    if (error) throw error;
    return domainReg;
  }

  try {
    const [sld, ...tldParts] = domain.split('.');
    const tld = tldParts.join('.');

    // Create domain registration record
    const { data: domainReg, error } = await supabase
      .from('domain_registrations')
      .insert({
        order_id: orderId,
        customer_id: userId,
        domain_name: domain,
        tld: `.${tld}`,
        years: years,
        id_protect: idProtect,
        nameservers: nameservers,
        status: 'registering',
        price: 12.99 * years,
        currency: 'GBP'
      })
      .select()
      .single();

    if (error) throw error;

    // Call eNom API to register domain
    const registerUrl = new URL('https://reseller.enom.com/interface.asp');
    registerUrl.searchParams.set('command', 'Purchase');
    registerUrl.searchParams.set('uid', enomUser);
    registerUrl.searchParams.set('pw', enomToken);
    registerUrl.searchParams.set('responsetype', 'JSON');
    registerUrl.searchParams.set('sld', sld);
    registerUrl.searchParams.set('tld', tld);
    registerUrl.searchParams.set('numyears', years.toString());
    
    // Add nameservers
    nameservers.forEach((ns, index) => {
      registerUrl.searchParams.set(`ns${index + 1}`, ns);
    });

    // Add ID protection if requested
    if (idProtect) {
      registerUrl.searchParams.set('idprotect', '1');
    }

    console.log(`Registering ${domain} with eNom for ${years} years`);
    
    const response = await fetch(registerUrl.toString());
    const data = await response.json();

    if (data['interface-response']?.ErrCount && parseInt(data['interface-response'].ErrCount) > 0) {
      throw new Error(`eNom registration failed: ${JSON.stringify(data['interface-response'].errors)}`);
    }

    // Update domain registration with success
    await supabase
      .from('domain_registrations')
      .update({
        status: 'active',
        registration_date: new Date().toISOString(),
        expiry_date: new Date(Date.now() + years * 365 * 24 * 60 * 60 * 1000).toISOString(),
        enom_order_id: data['interface-response']?.OrderID || `enom_${Date.now()}`
      })
      .eq('id', domainReg.id);

    return domainReg;
  } catch (error) {
    console.error('Domain registration failed:', error);
    
    // Update status to failed
    await supabase
      .from('domain_registrations')
      .update({ status: 'failed' })
      .eq('order_id', orderId);
    
    throw error;
  }
}

// Hosting account creation removed - credentials now managed externally via WHM admin panel
// This eliminates security risks of storing/transmitting cPanel passwords

// Hosting suspension removed - account management now handled externally via WHM admin panel

// Welcome email and credential generation removed for security
// Hosting credentials are now managed exclusively via WHM admin interface

serve(handler);