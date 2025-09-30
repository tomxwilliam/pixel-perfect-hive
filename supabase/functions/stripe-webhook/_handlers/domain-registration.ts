import Stripe from 'https://esm.sh/stripe@14.21.0';

export async function handleDomainRegistrationPayment(supabase: any, session: Stripe.Checkout.Session) {
  console.log('Processing domain registration payment:', session.id);

  const domainId = session.metadata?.domain_id;
  const customerId = session.metadata?.customer_id;
  const domainName = session.metadata?.domain_name;
  const tld = session.metadata?.tld;
  const years = parseInt(session.metadata?.years || '1');

  if (!domainId || !customerId) {
    console.error('Missing domain_id or customer_id in session metadata');
    return;
  }

  // Get domain record with registration data
  const { data: domain, error: domainError } = await supabase
    .from('domains')
    .select('*, registration_data')
    .eq('id', domainId)
    .single();

  if (domainError || !domain) {
    console.error('Domain not found:', domainError);
    return;
  }

  // Update domain status to processing
  await supabase
    .from('domains')
    .update({ status: 'processing' })
    .eq('id', domainId);

  try {
    // Register domain with eNom
    const enomUser = Deno.env.get('ENOM_API_USER');
    const enomToken = Deno.env.get('ENOM_API_TOKEN');
    
    let enomDomainId: string | null = null;
    let registrationSuccess = false;

    if (enomUser && enomToken && domain.registration_data) {
      const registrationData = domain.registration_data;
      
      console.log('Registering domain with eNom:', domainName);
      
      const registerUrl = new URL('https://reseller.enom.com/interface.asp');
      registerUrl.searchParams.set('command', 'Purchase');
      registerUrl.searchParams.set('uid', enomUser);
      registerUrl.searchParams.set('pw', enomToken);
      registerUrl.searchParams.set('responsetype', 'JSON');
      registerUrl.searchParams.set('domain', registrationData.domain);
      registerUrl.searchParams.set('tld', tld.replace('.', ''));
      registerUrl.searchParams.set('numyears', years.toString());
      
      // Contact information
      registerUrl.searchParams.set('RegistrantFirstName', registrationData.customer_details.first_name);
      registerUrl.searchParams.set('RegistrantLastName', registrationData.customer_details.last_name);
      registerUrl.searchParams.set('RegistrantEmailAddress', registrationData.customer_details.email);
      registerUrl.searchParams.set('RegistrantPhone', registrationData.customer_details.phone);
      registerUrl.searchParams.set('RegistrantAddress1', registrationData.customer_details.address);
      registerUrl.searchParams.set('RegistrantCity', registrationData.customer_details.city);
      registerUrl.searchParams.set('RegistrantPostalCode', registrationData.customer_details.postal_code);
      registerUrl.searchParams.set('RegistrantCountry', registrationData.customer_details.country);

      const response = await fetch(registerUrl.toString(), { method: 'POST' });
      const data = await response.json();
      
      console.log('eNom registration response:', data);

      if (data.RRPCode === '200' || data.OrderID) {
        registrationSuccess = true;
        enomDomainId = data.OrderID || data.DomainID || `enom_${Date.now()}`;
        
        // Configure nameservers
        if (enomDomainId) {
          await configureNameservers(enomUser, enomToken, registrationData.domain, tld);
        }
      } else {
        console.error('eNom registration failed:', data);
        throw new Error(data.RRPText || 'Registration failed');
      }
    } else {
      // Mock registration for development
      console.log('Using mock registration (eNom not configured)');
      enomDomainId = `mock_enom_${Date.now()}`;
      registrationSuccess = true;
    }

    if (registrationSuccess) {
      // Update domain to active status
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + years);

      await supabase
        .from('domains')
        .update({
          status: 'active',
          enom_domain_id: enomDomainId,
          expiry_date: expiryDate.toISOString().split('T')[0],
          registration_completed_at: new Date().toISOString()
        })
        .eq('id', domainId);

      // Send success email
      await sendDomainRegistrationEmail(supabase, customerId, domainName, domain.registration_data?.customer_details);

      // Send notification
      await supabase.rpc('send_notification', {
        p_user_id: customerId,
        p_title: 'Domain Registration Complete',
        p_message: `Your domain ${domainName} has been successfully registered and is now active!`,
        p_type: 'success',
        p_category: 'domain_registration',
        p_related_id: domainId,
        p_created_by: customerId
      });

      console.log('Domain registration completed successfully:', domainName);
    }
  } catch (error) {
    console.error('Error during domain registration:', error);
    
    // Update domain to failed status
    await supabase
      .from('domains')
      .update({ 
        status: 'failed',
        error_message: error.message
      })
      .eq('id', domainId);

    // Notify customer of failure
    await supabase.rpc('send_notification', {
      p_user_id: customerId,
      p_title: 'Domain Registration Failed',
      p_message: `There was an issue registering ${domainName}. Our team has been notified and will contact you shortly.`,
      p_type: 'error',
      p_category: 'domain_registration',
      p_related_id: domainId,
      p_created_by: customerId
    });
  }
}

async function configureNameservers(enomUser: string, enomToken: string, domain: string, tld: string) {
  console.log('Configuring nameservers for:', domain + tld);
  
  const nameservers = [
    'ns1.digitalocean.com',
    'ns2.digitalocean.com',
    'ns3.digitalocean.com'
  ];

  const nsUrl = new URL('https://reseller.enom.com/interface.asp');
  nsUrl.searchParams.set('command', 'ModifyNS');
  nsUrl.searchParams.set('uid', enomUser);
  nsUrl.searchParams.set('pw', enomToken);
  nsUrl.searchParams.set('responsetype', 'JSON');
  nsUrl.searchParams.set('domain', domain);
  nsUrl.searchParams.set('tld', tld.replace('.', ''));
  
  nameservers.forEach((ns, index) => {
    nsUrl.searchParams.set(`NS${index + 1}`, ns);
  });

  const response = await fetch(nsUrl.toString(), { method: 'POST' });
  const data = await response.json();
  
  console.log('Nameserver configuration response:', data);
  
  return data;
}

async function sendDomainRegistrationEmail(supabase: any, customerId: string, domainName: string, customerDetails: any) {
  console.log('Sending domain registration email to:', customerDetails?.email);

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, first_name, last_name')
    .eq('id', customerId)
    .single();

  if (!profile?.email) {
    console.error('No email found for customer');
    return;
  }

  const emailContent = `
    <h1>Domain Registration Complete!</h1>
    <p>Hi ${profile.first_name || 'there'},</p>
    <p>Great news! Your domain <strong>${domainName}</strong> has been successfully registered.</p>
    
    <h2>Domain Details:</h2>
    <ul>
      <li><strong>Domain:</strong> ${domainName}</li>
      <li><strong>Status:</strong> Active</li>
      <li><strong>Nameservers:</strong>
        <ul>
          <li>ns1.digitalocean.com</li>
          <li>ns2.digitalocean.com</li>
          <li>ns3.digitalocean.com</li>
        </ul>
      </li>
    </ul>

    <h2>Next Steps:</h2>
    <ol>
      <li>Your domain is now active and propagating across the internet (this can take up to 48 hours)</li>
      <li>You can manage your domain from your dashboard</li>
      <li>Configure DNS records as needed for your website</li>
    </ol>

    <p>If you have any questions, please don't hesitate to contact our support team.</p>
    
    <p>Best regards,<br>
    The 404 Code Lab Team</p>
  `;

  try {
    await supabase.functions.invoke('send-email', {
      body: {
        to: profile.email,
        subject: `Domain Registration Complete: ${domainName}`,
        content: emailContent,
        email_type: 'domain_registration',
        customer_id: customerId
      }
    });
    
    console.log('Domain registration email sent successfully');
  } catch (error) {
    console.error('Failed to send domain registration email:', error);
  }
}
