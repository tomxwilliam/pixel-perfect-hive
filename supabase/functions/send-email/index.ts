import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  template_type?: string;
  template_data?: any;
  customer_id?: string;
  ai_generated?: boolean;
  cc?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, subject, content, template_type, template_data, customer_id, ai_generated = false, cc }: EmailRequest = await req.json();

    if (!to || !subject || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get email template if template_type provided
    let finalContent = content;
    let finalSubject = subject;

    if (template_type) {
      const { data: template } = await supabaseClient
        .from('email_templates')
        .select('*')
        .eq('template_type', template_type)
        .eq('is_active', true)
        .single();

      if (template) {
        finalSubject = template.subject;
        finalContent = template.body_html;
        
        if (template_data) {
          for (const [key, value] of Object.entries(template_data)) {
            const placeholder = `{{${key}}}`;
            finalSubject = finalSubject.replace(new RegExp(placeholder, 'g'), String(value));
            finalContent = finalContent.replace(new RegExp(placeholder, 'g'), String(value));
          }
        }
      }
    }

    // Initialize SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get('SMTP_HOST') ?? '',
        port: Number(Deno.env.get('SMTP_PORT') ?? '465'),
        tls: true,
        auth: {
          username: Deno.env.get('SMTP_USER') ?? '',
          password: Deno.env.get('SMTP_PASSWORD') ?? '',
        },
      },
    });

    console.log('Sending email via SMTP:', {
      to,
      subject: finalSubject,
      template_type,
      from: Deno.env.get('SMTP_FROM_EMAIL')
    });

    // Send email via SMTP
    await client.send({
      from: Deno.env.get('SMTP_FROM_EMAIL') ?? 'hello@404codelab.com',
      to: to,
      cc: cc?.join(', '),
      subject: finalSubject,
      content: finalContent,
      html: finalContent,
    });

    await client.close();

    console.log('Email sent successfully via SMTP');

    // Log email in database
    const { data: emailLog } = await supabaseClient
      .from('email_logs')
      .insert({
        recipient_email: to,
        subject: finalSubject,
        content: finalContent,
        email_type: template_type || 'custom',
        customer_id: customer_id,
        ai_generated: ai_generated,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    return new Response(JSON.stringify({ 
      success: true, 
      email_id: emailLog?.id,
      message: 'Email sent successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Email send error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send email', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});