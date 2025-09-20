import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestEmailRequest {
  templateId: string;
  email: string;
  variables?: Record<string, string>;
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

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const { templateId, email, variables = {} }: TestEmailRequest = await req.json();

    console.log('Sending test email for template:', templateId, 'to:', email);

    // Fetch the template from Supabase
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      throw new Error('Template not found');
    }

    // Default test variables
    const testVariables = {
      domain: 'example.com',
      registration_date: new Date().toLocaleDateString(),
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      nameservers: 'ns1.404codelab.com, ns2.404codelab.com',
      package_name: 'Business Hosting',
      cpanel_url: 'https://cpanel.example.com',
      username: 'testuser',
      server_ip: '192.168.1.100',
      invoice_number: 'INV-2024-001',
      amount: '£29.99',
      payment_date: new Date().toLocaleDateString(),
      payment_method: 'Credit Card',
      ticket_number: '12345',
      subject: 'Test Support Request',
      priority: 'Medium',
      created_date: new Date().toLocaleDateString(),
      sla_hours: '24',
      service: 'Domain Registration',
      renewal_date: new Date().toLocaleDateString(),
      next_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      reason: 'Non-payment',
      support_url: 'https://support.404codelab.com',
      renewal_url: 'https://billing.404codelab.com/renew',
      recovery_url: 'https://billing.404codelab.com/recover',
      ticket_url: 'https://support.404codelab.com/tickets/12345',
      feedback_url: 'https://support.404codelab.com/feedback',
      response: 'Thank you for contacting us. We have received your request and will respond shortly.',
      days_remaining: '5',
      ...variables
    };

    // Replace variables in subject and body
    let subject = template.subject;
    let body = template.body_html || template.body;

    Object.entries(testVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    // Add test email header
    const testBody = `
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 12px; margin-bottom: 20px; border-radius: 4px;">
        <strong>🧪 TEST EMAIL</strong><br>
        <small>Template: ${template.name} (${template.category})</small><br>
        <small>Template ID: ${templateId}</small>
      </div>
      ${body}
    `;

    const emailResponse = await resend.emails.send({
      from: '404 CodeLab <onboarding@resend.dev>',
      to: [email],
      subject: `[TEST] ${subject}`,
      html: testBody,
    });

    console.log('Test email sent successfully:', emailResponse);

    // Log the test email
    await supabase
      .from('email_logs')
      .insert({
        recipient_email: email,
        subject: `[TEST] ${subject}`,
        content: testBody,
        email_type: 'test',
        ai_generated: false
      });

    return new Response(JSON.stringify({
      success: true,
      message: 'Test email sent successfully',
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-test-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);