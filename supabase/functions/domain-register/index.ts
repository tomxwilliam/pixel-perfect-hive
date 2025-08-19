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

    const { domain, tld, price, customerId }: DomainRegistrationRequest = await req.json();

    // Check permission: admins can register for anyone; users only for themselves
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    if (!isAdmin && user.id !== customerId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    console.log(`Processing domain registration: ${domain}${tld} for customer: ${customerId}`);

    // Create domain record
    const { data: domainData, error: domainError } = await supabase
      .from('domains')
      .insert({
        customer_id: customerId,
        domain_name: domain,
        tld: tld,
        price: price,
        status: 'pending'
      })
      .select()
      .single();

    if (domainError) {
      throw new Error(`Failed to create domain record: ${domainError.message}`);
    }

    // Create invoice
    const invoiceNumber = `INV-${Date.now()}`;
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        customer_id: customerId,
        invoice_number: invoiceNumber,
        amount: price,
        status: 'pending',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
      })
      .select()
      .single();

    if (invoiceError) {
      throw new Error(`Failed to create invoice: ${invoiceError.message}`);
    }

    // Update domain with invoice ID
    await supabase
      .from('domains')
      .update({ invoice_id: invoiceData.id })
      .eq('id', domainData.id);

    // Create provisioning request
    const { error: provisioningError } = await supabase
      .from('provisioning_requests')
      .insert({
        customer_id: customerId,
        request_type: 'domain_registration',
        entity_id: domainData.id,
        status: 'pending',
        priority: 1
      });

    if (provisioningError) {
      console.error('Failed to create provisioning request:', provisioningError);
    }

    // Send notification to customer
    await supabase.rpc('send_notification', {
      p_user_id: customerId,
      p_title: 'Domain Registration Initiated',
      p_message: `Your domain registration for ${domain}${tld} has been initiated. You will receive an invoice shortly.`,
      p_type: 'info',
      p_category: 'domains',
      p_related_id: domainData.id
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
          p_title: 'New Domain Registration',
          p_message: `New domain registration: ${domain}${tld} for £${price}`,
          p_type: 'info',
          p_category: 'admin',
          p_related_id: domainData.id
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      domain: domainData,
      invoice: invoiceData,
      message: 'Domain registration initiated successfully'
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