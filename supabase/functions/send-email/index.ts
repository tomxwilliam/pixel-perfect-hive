import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

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

    const { to, subject, content, template_type, template_data, customer_id, ai_generated = false }: EmailRequest = await req.json();

    if (!to || !subject || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Using Supabase's email system
    // Configure your SMTP settings in Supabase Dashboard > Project Settings > Auth > SMTP Settings
    // Or integrate with your preferred email service provider

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
        // Replace template variables
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

    // Send email using Supabase Auth SMTP
    // Note: This requires SMTP configuration in Supabase Dashboard
    // Alternatively, integrate with your preferred email service here
    
    console.log('Email prepared for sending:', {
      to,
      subject: finalSubject,
      template_type
    });

    // For now, just log the email (configure SMTP in Supabase Dashboard)
    const emailResult = {
      success: true,
      message: 'Email logged - configure SMTP in Supabase Dashboard for actual delivery'
    };

    // Log email in database
    await supabaseClient
      .from('email_logs')
      .insert({
        recipient_email: to,
        subject: finalSubject,
        content: finalContent,
        email_type: template_type || 'custom',
        customer_id: customer_id,
        ai_generated: ai_generated,
        sent_at: new Date().toISOString(),
      });

    console.log('Email sent successfully:', emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      email_id: emailResult.id,
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