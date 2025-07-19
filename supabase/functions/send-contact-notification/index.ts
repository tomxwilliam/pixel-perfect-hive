import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  category: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, phoneNumber, category, subject, message }: ContactFormRequest = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a lead entry first
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert({
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phoneNumber,
        company: null,
        source: 'contact_form',
        notes: `Contact form submission - Category: ${category}, Subject: ${subject}, Message: ${message}`
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error creating lead:', leadError);
    }

    // Create a support ticket
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        title: subject,
        description: `Contact form submission from ${firstName} ${lastName} (${email})\n\nCategory: ${category}\nPhone: ${phoneNumber || 'Not provided'}\n\nMessage:\n${message}`,
        priority: 'medium',
        status: 'open',
        customer_id: null // No customer ID since this is from contact form
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Error creating ticket:', ticketError);
      throw new Error('Failed to create support ticket');
    }

    // Send email notification to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission
        </h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #007bff;">Contact Details:</h3>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        
        <div style="background: #fff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
          <h4 style="margin-top: 0;">Message:</h4>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        
        <p>A support ticket (#${ticketData.id.substring(0, 8)}) has been automatically created.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            This email was sent from your 404 Code Lab contact form.<br>
            <a href="mailto:${email}">Reply directly to ${email}</a>
          </p>
        </div>
      </div>
    `;

    // Send confirmation email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Thank You for Contacting 404 Code Lab!
        </h1>
        
        <p>Hi ${firstName},</p>
        
        <p>Thank you for reaching out to us. We've received your message and will get back to you within 24 hours.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #007bff;">Your Message Summary:</h3>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Ticket ID:</strong> #${ticketData.id.substring(0, 8)}</p>
        </div>
        
        <p>In the meantime, feel free to:</p>
        <ul>
          <li>Check out our portfolio at <a href="https://404codelab.com">404codelab.com</a></li>
          <li>Follow us on social media for updates</li>
          <li>Message us on WhatsApp for urgent queries</li>
        </ul>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            404 Code Lab Team<br>
            <a href="mailto:hello@404codelab.com">hello@404codelab.com</a>
          </p>
        </div>
      </div>
    `;

    // Send both emails
    await Promise.all([
      // Email to admin
      resend.emails.send({
        from: "404 Code Lab <onboarding@resend.dev>",
        to: ["hello@404codelab.com"],
        subject: `New Contact Form: ${subject}`,
        html: adminEmailHtml,
      }),
      // Confirmation email to customer
      resend.emails.send({
        from: "404 Code Lab <onboarding@resend.dev>",
        to: [email],
        subject: "Thank you for contacting 404 Code Lab!",
        html: customerEmailHtml,
      })
    ]);

    console.log("Contact form processed and emails sent successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      ticketId: ticketData.id,
      message: "Contact form submitted successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);