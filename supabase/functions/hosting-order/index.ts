import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HostingOrderRequest {
  packageId: string;
  customerId: string;
  domainId?: string;
  billingCycle: 'monthly' | 'annual';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is authenticated and allowed
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

    const { packageId, customerId, domainId, billingCycle }: HostingOrderRequest = await req.json();

    // Check permission: admins can order for anyone; users only for themselves
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    if (!isAdmin && user.id !== customerId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    console.log(`Processing hosting order: Package ${packageId} for customer: ${customerId}`);

    // Get package details
    const { data: hostingPackage, error: packageError } = await supabase
      .from('hosting_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (packageError || !hostingPackage) {
      throw new Error('Hosting package not found');
    }

    // Calculate pricing based on billing cycle
    const price = billingCycle === 'annual' 
      ? (hostingPackage.annual_price || hostingPackage.monthly_price * 12)
      : hostingPackage.monthly_price;

    const setupFee = hostingPackage.setup_fee || 0;
    const totalAmount = price + setupFee;

    // Create hosting subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('hosting_subscriptions')
      .insert({
        customer_id: customerId,
        package_id: packageId,
        domain_id: domainId || null,
        billing_cycle: billingCycle,
        status: 'pending',
        next_billing_date: billingCycle === 'annual' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      .select()
      .single();

    if (subscriptionError) {
      throw new Error(`Failed to create hosting subscription: ${subscriptionError.message}`);
    }

    // Create invoice
    const invoiceNumber = `INV-HOST-${Date.now()}`;
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        customer_id: customerId,
        invoice_number: invoiceNumber,
        amount: totalAmount,
        status: 'pending',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      .select()
      .single();

    if (invoiceError) {
      throw new Error(`Failed to create invoice: ${invoiceError.message}`);
    }

    // Update subscription with invoice ID
    await supabase
      .from('hosting_subscriptions')
      .update({ invoice_id: invoice.id })
      .eq('id', subscription.id);

    // Create provisioning request
    const { error: provisioningError } = await supabase
      .from('provisioning_requests')
      .insert({
        customer_id: customerId,
        request_type: 'hosting_setup',
        entity_id: subscription.id,
        status: 'pending',
        priority: 1
      });

    if (provisioningError) {
      console.error('Failed to create provisioning request:', provisioningError);
    }

    // Send notification to customer
    await supabase.rpc('send_notification', {
      p_user_id: customerId,
      p_title: 'Hosting Order Received',
      p_message: `Your ${hostingPackage.package_name} hosting order has been received. Account setup will begin after payment.`,
      p_type: 'info',
      p_category: 'hosting',
      p_related_id: subscription.id
    });

    // Send notification to admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (admins) {
      for (const admin of admins) {
        await supabase.rpc('send_notification', {
          p_user_id: admin.id,
          p_title: 'New Hosting Order',
          p_message: `New hosting order: ${hostingPackage.package_name} (${billingCycle}) for £${totalAmount}`,
          p_type: 'info',
          p_category: 'admin',
          p_related_id: subscription.id
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      subscription: subscription,
      invoice: invoice,
      message: 'Hosting order created successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in hosting-order function:', error);
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