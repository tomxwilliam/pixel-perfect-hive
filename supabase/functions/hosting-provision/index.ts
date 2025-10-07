import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HostingProvisionRequest {
  subscriptionId: string;
  action: 'create' | 'suspend' | 'unsuspend' | 'terminate';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: only admins can call provisioning
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

    // Check if user is admin using secure has_role() function
    const { data: isAdmin } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const { subscriptionId, action }: HostingProvisionRequest = await req.json();

    console.log(`Processing hosting provisioning: ${action} for subscription ${subscriptionId}`);

    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('hosting_subscriptions')
      .select(`
        *,
        hosting_packages(*),
        profiles!hosting_subscriptions_customer_id_fkey(first_name, last_name, email),
        domains(domain_name, tld)
      `)
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      throw new Error('Hosting subscription not found');
    }

    const hostingApiKey = Deno.env.get('UNLIMITED_WEB_HOSTING_API_KEY');
    const hostingApiUrl = Deno.env.get('UNLIMITED_WEB_HOSTING_API_URL');

    let provisioningResult = { success: false, accountDetails: null };

    if (hostingApiKey && hostingApiUrl) {
      // Real hosting provider API integration
      try {
        console.log('Using real hosting provider API for provisioning');
        
        switch (action) {
          case 'create':
            provisioningResult = await createHostingAccount(
              hostingApiUrl,
              hostingApiKey,
              subscription
            );
            break;
          case 'suspend':
            provisioningResult = await suspendHostingAccount(
              hostingApiUrl,
              hostingApiKey,
              subscription.hosting_provider_account_id
            );
            break;
          case 'unsuspend':
            provisioningResult = await unsuspendHostingAccount(
              hostingApiUrl,
              hostingApiKey,
              subscription.hosting_provider_account_id
            );
            break;
          case 'terminate':
            provisioningResult = await terminateHostingAccount(
              hostingApiUrl,
              hostingApiKey,
              subscription.hosting_provider_account_id
            );
            break;
        }
      } catch (error) {
        console.error('Hosting provider API error:', error);
        throw new Error(`Hosting provisioning failed: ${error.message}`);
      }
    } else {
      console.log('Hosting provider credentials not configured, using mock provisioning');
      // Mock provisioning for development
      provisioningResult = {
        success: true,
        accountDetails: action === 'create' ? {
          accountId: `mock_${Date.now()}`,
          username: `user_${subscription.customer_id.slice(0, 8)}`,
          password: generateRandomPassword(),
          serverIp: '192.168.1.100',
          cpanelUrl: 'https://cpanel.example.com'
        } : null
      };
    }

    if (!provisioningResult.success) {
      throw new Error('Hosting provisioning failed');
    }

    // Update subscription based on action
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    switch (action) {
      case 'create':
        updates.status = 'active';
        updates.provisioned_at = new Date().toISOString();
        if (provisioningResult.accountDetails) {
          updates.hosting_provider_account_id = provisioningResult.accountDetails.accountId;
          updates.cpanel_username = provisioningResult.accountDetails.username;
          
          // Encrypt password before storing using database function
          const { data: encryptedPassword } = await supabase
            .rpc('encrypt_hosting_credential', { 
              plaintext: provisioningResult.accountDetails.password 
            });
          
          updates.cpanel_password_encrypted = encryptedPassword;
          updates.server_ip = provisioningResult.accountDetails.serverIp;
        }
        break;
      case 'suspend':
        updates.status = 'suspended';
        break;
      case 'unsuspend':
        updates.status = 'active';
        break;
      case 'terminate':
        updates.status = 'terminated';
        updates.expires_at = new Date().toISOString();
        break;
    }

    const { error: updateError } = await supabase
      .from('hosting_subscriptions')
      .update(updates)
      .eq('id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    // Update provisioning request if exists
    await supabase
      .from('provisioning_requests')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('entity_id', subscriptionId)
      .eq('request_type', 'hosting_setup');

    // Send notification to customer
    const notificationMessages = {
      create: `Your ${subscription.hosting_packages.package_name} hosting account has been activated!`,
      suspend: 'Your hosting account has been suspended.',
      unsuspend: 'Your hosting account has been reactivated.',
      terminate: 'Your hosting account has been terminated.'
    };

    await supabase.rpc('send_notification', {
      p_user_id: subscription.customer_id,
      p_title: 'Hosting Account Update',
      p_message: notificationMessages[action],
      p_type: action === 'create' || action === 'unsuspend' ? 'success' : 'warning',
      p_category: 'hosting',
      p_related_id: subscriptionId
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Hosting account ${action} completed successfully`,
      accountDetails: action === 'create' ? provisioningResult.accountDetails : null
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in hosting-provision function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function createHostingAccount(apiUrl: string, apiKey: string, subscription: any) {
  const response = await fetch(`${apiUrl}/accounts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: `user_${subscription.customer_id.slice(0, 8)}`,
      email: subscription.profiles.email,
      package: subscription.hosting_packages.package_name.toLowerCase(),
      domain: subscription.domains?.domain_name || `temp${Date.now()}.com`
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    success: true,
    accountDetails: {
      accountId: data.account_id,
      username: data.username,
      password: data.password,
      serverIp: data.server_ip,
      cpanelUrl: data.cpanel_url
    }
  };
}

async function suspendHostingAccount(apiUrl: string, apiKey: string, accountId: string) {
  const response = await fetch(`${apiUrl}/accounts/${accountId}/suspend`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return { success: true, accountDetails: null };
}

async function unsuspendHostingAccount(apiUrl: string, apiKey: string, accountId: string) {
  const response = await fetch(`${apiUrl}/accounts/${accountId}/unsuspend`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return { success: true, accountDetails: null };
}

async function terminateHostingAccount(apiUrl: string, apiKey: string, accountId: string) {
  const response = await fetch(`${apiUrl}/accounts/${accountId}/terminate`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return { success: true, accountDetails: null };
}

function generateRandomPassword(): string {
  // Use Web Crypto for strong randomness and enforce complexity
  const length = 20;
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*()-_=+';
  const all = upper + lower + digits + symbols;

  const getRand = (n: number) => {
    const buf = new Uint32Array(n);
    crypto.getRandomValues(buf);
    return Array.from(buf, x => x % all.length);
  };

  // Ensure at least one of each required character type
  const pick = (set: string) => set[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] % set.length)];
  let password = pick(upper) + pick(lower) + pick(digits) + pick(symbols);

  const idxs = getRand(length - 4);
  for (let i = 0; i < idxs.length; i++) password += all[idxs[i]];

  // Shuffle password
  const chars = password.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

serve(handler);