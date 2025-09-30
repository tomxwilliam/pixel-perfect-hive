import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import Stripe from "https://esm.sh/stripe@14.21.0";
import { handleDomainRegistrationPayment } from './_handlers/domain-registration.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

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
  
  // Handle legacy invoice payments
  if (invoiceId) {
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: session.payment_intent as string
      })
      .eq('id', invoiceId);
    
    console.log(`Invoice ${invoiceId} marked as paid`);
  }
  
  // Handle new combined hosting + domain orders
  if (orderId) {
    await processHostingDomainOrder(supabase, session);
  }
}

// Handle invoice.payment_succeeded
async function handleInvoicePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  console.log(`Invoice payment succeeded: ${invoice.id}`);
  
  if (invoice.subscription) {
    // Handle subscription renewals
    const metadata = invoice.metadata || {};
    if (metadata.domain && metadata.order_id) {
      await processHostingDomainOrder(supabase, {
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
  
  if (invoice.subscription) {
    await suspendHostingServices(supabase, invoice.customer as string, 'payment_failed');
  }
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
  // Could trigger hosting suspension or domain transfer back
}

// Process hosting and domain order after successful payment
async function processHostingDomainOrder(supabase: any, session: any) {
  try {
    const orderId = session.metadata?.order_id;
    const domain = session.metadata?.domain;
    const years = parseInt(session.metadata?.years || '1');
    const idProtect = session.metadata?.id_protect === 'true';
    const nameservers = JSON.parse(session.metadata?.nameservers || '["ns1.404codelab.com", "ns2.404codelab.com"]');
    const whmPackage = session.metadata?.whm_package;
    const hostingPackageId = session.metadata?.hosting_package_id;
    const userId = session.metadata?.supabase_user_id;

    if (!orderId || !domain || !userId) {
      throw new Error('Missing required metadata for order processing');
    }

    console.log(`Processing order ${orderId} for domain ${domain}`);

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'processing',
        stripe_payment_intent_id: session.payment_intent,
        completed_at: new Date().toISOString()
      })
      .eq('id', orderId);

    // Register domain with eNom
    const domainRegistration = await registerDomainWithEnom(
      supabase, domain, years, idProtect, nameservers, orderId, userId
    );

    // Create hosting account with WHM
    const hostingAccount = await createHostingAccountWithWHM(
      supabase, domain, whmPackage, orderId, userId, hostingPackageId
    );

    // Mark order as completed
    await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId);

    // Send welcome email
    await sendWelcomeEmail(supabase, userId, domain, hostingAccount);

    console.log(`Successfully provisioned hosting and domain for ${domain}`);
  } catch (error) {
    console.error('Error processing hosting/domain order:', error);
    
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

// Create hosting account with WHM
async function createHostingAccountWithWHM(
  supabase: any,
  domain: string,
  packageName: string,
  orderId: string,
  userId: string,
  hostingPackageId: string
) {
  const whmUrl = Deno.env.get('WHM_API_URL');
  const whmToken = Deno.env.get('WHM_API_TOKEN');

  // Generate credentials
  const username = domain.replace(/[^a-z0-9]/gi, '').substring(0, 8) + Math.random().toString(36).substring(2, 4);
  const password = generateRandomPassword();

  // Create hosting account record
  const { data: hostingAccount, error } = await supabase
    .from('hosting_accounts')
    .insert({
      order_id: orderId,
      customer_id: userId,
      hosting_package_id: hostingPackageId,
      domain_name: domain,
      cpanel_username: username,
      cpanel_password: password,
      status: 'provisioning'
    })
    .select()
    .single();

  if (error) throw error;

  if (!whmUrl || !whmToken) {
    console.warn('WHM credentials not configured, creating mock hosting account');
    
    // Update with mock data
    await supabase
      .from('hosting_accounts')
      .update({
        status: 'active',
        whm_account_id: `mock_${Date.now()}`,
        server_ip: '192.168.1.100',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', hostingAccount.id);

    return { ...hostingAccount, cpanel_username: username, cpanel_password: password };
  }

  try {
    // Call WHM API to create account
    const whmApiUrl = new URL('/json-api/createacct', whmUrl);
    
    const whmParams = {
      username: username,
      password: password,
      domain: domain,
      plan: packageName || 'default',
      contactemail: 'admin@404codelab.com'
    };

    const response = await fetch(whmApiUrl.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `whm root:${whmToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(whmParams).toString()
    });

    const data = await response.json();

    if (!data.metadata?.result || data.metadata.result !== 1) {
      throw new Error(`WHM account creation failed: ${data.metadata?.reason || 'Unknown error'}`);
    }

    console.log(`Created hosting account for ${domain} with username ${username}`);

    // Update hosting account with success
    await supabase
      .from('hosting_accounts')
      .update({
        status: 'active',
        whm_account_id: data.data?.acct || `whm_${Date.now()}`,
        server_ip: whmUrl.replace(/^https?:\/\//, '').split(':')[0],
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', hostingAccount.id);

    return { ...hostingAccount, cpanel_username: username, cpanel_password: password };
  } catch (error) {
    console.error('Hosting account creation failed:', error);
    
    // Update status to failed
    await supabase
      .from('hosting_accounts')
      .update({ status: 'failed' })
      .eq('id', hostingAccount.id);
    
    throw error;
  }
}

// Suspend hosting services
async function suspendHostingServices(supabase: any, customerId: string, reason: string) {
  try {
    const { data: hostingAccounts } = await supabase
      .from('hosting_accounts')
      .select('*')
      .eq('customer_id', customerId)
      .eq('status', 'active');

    for (const account of hostingAccounts || []) {
      await suspendWHMAccount(account.whm_account_id);
      
      await supabase
        .from('hosting_accounts')
        .update({
          status: 'suspended',
          suspended_at: new Date().toISOString()
        })
        .eq('id', account.id);
    }

    console.log(`Suspended ${hostingAccounts?.length || 0} hosting accounts for customer ${customerId} due to ${reason}`);
  } catch (error) {
    console.error('Error suspending hosting services:', error);
  }
}

// Suspend WHM account
async function suspendWHMAccount(accountId: string) {
  const whmUrl = Deno.env.get('WHM_API_URL');
  const whmToken = Deno.env.get('WHM_API_TOKEN');

  if (!whmUrl || !whmToken) {
    console.log(`Would suspend WHM account ${accountId} (WHM not configured)`);
    return;
  }

  try {
    const suspendUrl = new URL('/json-api/suspendacct', whmUrl);
    suspendUrl.searchParams.set('user', accountId);
    suspendUrl.searchParams.set('reason', 'Payment failed or subscription cancelled');

    const response = await fetch(suspendUrl.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `whm root:${whmToken}`
      }
    });

    const data = await response.json();
    console.log(`Suspended WHM account ${accountId}:`, data);
  } catch (error) {
    console.error(`Failed to suspend WHM account ${accountId}:`, error);
  }
}

// Generate random password
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Send welcome email with domain and cPanel details
async function sendWelcomeEmail(supabase: any, userId: string, domain: string, hostingAccount: any) {
  try {
    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (!profile?.email) {
      console.error('No email found for user:', userId);
      return;
    }

    console.log(`Sending welcome email to ${profile.email} for domain ${domain}`);
    
    // Call send-email function with welcome template
    await supabase.functions.invoke('send-email', {
      body: {
        to: profile.email,
        subject: `Welcome! Your domain ${domain} is ready`,
        template: 'welcome_hosting_domain',
        data: {
          customerName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Customer',
          domain: domain,
          cpanelUsername: hostingAccount.cpanel_username,
          cpanelPassword: hostingAccount.cpanel_password,
          serverIp: hostingAccount.server_ip || 'Will be provided separately',
          cpanelUrl: `https://${domain}:2083` // Standard cPanel URL
        }
      }
    });

    console.log(`Welcome email sent successfully to ${profile.email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - email failure shouldn't fail the entire process
  }
}

serve(handler);