import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// Process hosting and domain order after successful payment
async function processHostingDomainOrder(supabase: any, session: Stripe.Checkout.Session) {
  try {
    const orderId = session.metadata?.order_id;
    const domain = session.metadata?.domain;
    const years = parseInt(session.metadata?.years || '1');
    const idProtect = session.metadata?.id_protect === 'true';
    const nameservers = JSON.parse(session.metadata?.nameservers || '[]');
    const whmPackage = session.metadata?.whm_package;
    const hostingPackageId = session.metadata?.hosting_package_id;

    console.log(`Processing order ${orderId} for domain ${domain}`);

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent,
        completed_at: new Date().toISOString()
      })
      .eq('id', orderId);

    // Re-check domain availability
    const isAvailable = await checkDomainAvailability(domain);
    if (!isAvailable) {
      throw new Error(`Domain ${domain} is no longer available`);
    }

    // Register domain with eNom
    const domainRegistration = await registerDomainWithEnom(
      domain, years, idProtect, nameservers, orderId, session.customer as string
    );

    // Create hosting account with WHM
    const hostingAccount = await createHostingAccountWithWHM(
      domain, whmPackage, orderId, session.customer as string, hostingPackageId
    );

    // Send credentials email
    await sendCredentialsEmail(session.customer as string, domain, hostingAccount.cpanel_username, hostingAccount.cpanel_password);

    console.log(`Successfully provisioned hosting and domain for ${domain}`);
  } catch (error) {
    console.error('Error processing hosting/domain order:', error);
    // Update order status to failed
    if (session.metadata?.order_id) {
      await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', session.metadata.order_id);
    }
    throw error;
  }
}

// Check domain availability with eNom
async function checkDomainAvailability(domain: string): Promise<boolean> {
  const enomUser = Deno.env.get('ENOM_API_USER');
  const enomToken = Deno.env.get('ENOM_API_TOKEN');
  
  if (!enomUser || !enomToken) {
    console.log('eNom not configured, assuming domain available');
    return true;
  }

  try {
    const [sld, ...tldParts] = domain.split('.');
    const tld = tldParts.join('.');

    const searchUrl = new URL('https://reseller.enom.com/interface.asp');
    searchUrl.searchParams.set('command', 'Check');
    searchUrl.searchParams.set('uid', enomUser);
    searchUrl.searchParams.set('pw', enomToken);
    searchUrl.searchParams.set('responsetype', 'JSON');
    searchUrl.searchParams.set('domain', sld);
    searchUrl.searchParams.set('tld', tld);

    const response = await fetch(searchUrl.toString());
    if (!response.ok) return false;

    const data = await response.json();
    if (data['interface-response']) {
      const enomResponse = data['interface-response'];
      return enomResponse.RRPCode === '210' || enomResponse.DomainAvailable === '1';
    }
    return false;
  } catch (error) {
    console.error('Domain availability check failed:', error);
    return false;
  }
}

// Register domain with eNom
async function registerDomainWithEnom(domain: string, years: number, idProtect: boolean, nameservers: string[], orderId: string, customerId: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const enomUser = Deno.env.get('ENOM_API_USER');
  const enomToken = Deno.env.get('ENOM_API_TOKEN');

  if (!enomUser || !enomToken) {
    throw new Error('eNom credentials not configured');
  }

  try {
    const [sld, ...tldParts] = domain.split('.');
    const tld = tldParts.join('.');

    // Create domain registration record
    const { data: domainReg, error } = await supabase
      .from('domain_registrations')
      .insert({
        order_id: orderId,
        customer_id: customerId,
        domain_name: domain,
        tld: `.${tld}`,
        years: years,
        id_protect: idProtect,
        nameservers: nameservers,
        status: 'registering'
      })
      .select()
      .single();

    if (error) throw error;

    // Register with eNom (mock implementation - replace with actual eNom registration)
    console.log(`Registering ${domain} with eNom for ${years} years`);
    
    // Update domain registration with success
    await supabase
      .from('domain_registrations')
      .update({
        status: 'active',
        registration_date: new Date().toISOString(),
        expiry_date: new Date(Date.now() + years * 365 * 24 * 60 * 60 * 1000).toISOString(),
        enom_order_id: `enom_${Date.now()}`
      })
      .eq('id', domainReg.id);

    return domainReg;
  } catch (error) {
    console.error('Domain registration failed:', error);
    throw error;
  }
}

// Create hosting account with WHM
async function createHostingAccountWithWHM(domain: string, packageName: string, orderId: string, customerId: string, hostingPackageId: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const whmUrl = Deno.env.get('WHM_API_URL');
  const whmToken = Deno.env.get('WHM_API_TOKEN');

  if (!whmUrl || !whmToken) {
    throw new Error('WHM credentials not configured');
  }

  try {
    // Generate credentials
    const username = domain.replace(/[^a-z0-9]/gi, '').substring(0, 8) + Math.random().toString(36).substring(2, 6);
    const password = generateRandomPassword();
    
    // Create hosting account record
    const { data: hostingAccount, error } = await supabase
      .from('hosting_accounts')
      .insert({
        order_id: orderId,
        customer_id: customerId,
        hosting_package_id: hostingPackageId,
        domain_name: domain,
        cpanel_username: username,
        cpanel_password: password,
        status: 'provisioning'
      })
      .select()
      .single();

    if (error) throw error;

    // Create account with WHM (mock implementation - replace with actual WHM API)
    console.log(`Creating hosting account for ${domain} with package ${packageName}`);
    
    // Update hosting account with success
    await supabase
      .from('hosting_accounts')
      .update({
        status: 'active',
        whm_account_id: `whm_${Date.now()}`,
        server_ip: '192.168.1.100', // Replace with actual server IP
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', hostingAccount.id);

    return { ...hostingAccount, cpanel_username: username, cpanel_password: password };
  } catch (error) {
    console.error('Hosting account creation failed:', error);
    throw error;
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

// Send credentials email
async function sendCredentialsEmail(customerId: string, domain: string, username: string, password: string) {
  console.log(`Sending credentials email for ${domain} to customer ${customerId}`);
  // Implementation would use Resend or similar email service
  // For now, just log the credentials
  console.log(`cPanel Username: ${username}, Password: ${password}`);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
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

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return new Response('Webhook signature verification failed', { status: 400 });
      }
    } else {
      // For development without webhook secret
      event = JSON.parse(body);
    }

    console.log(`Received webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
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
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle subscription invoice payments if needed
        console.log(`Invoice payment succeeded: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment failed: ${invoice.id}`);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${event.type}: ${subscription.id}`);
        // Handle subscription changes if needed
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentIntent.id}`);
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log(`Dispute created: ${dispute.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
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

serve(handler);