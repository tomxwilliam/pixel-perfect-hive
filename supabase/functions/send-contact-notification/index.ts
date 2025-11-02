import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  // Support both contact form and ads form formats
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  category?: string;
  subject?: string;
  message: string;
  
  // Additional fields for ads forms
  source?: string;
  projectType?: string;
  budget?: string;
  appType?: string;
  platform?: string;
  gameType?: string;
  currentStage?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ContactFormRequest = await req.json();
    
    // Handle both form formats
    const fullName = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim();
    const phoneNumber = data.phone || data.phoneNumber;
    const source = data.source || 'contact_form';
    const subject = data.subject || `New ${data.projectType || data.appType || data.gameType || 'Lead'} Inquiry`;
    const category = data.category || 'general';
    
    // Build comprehensive notes with all available info
    let notes = `Contact form submission - Category: ${category}, Subject: ${subject}, Message: ${data.message}`;
    if (data.projectType) notes += `\nProject Type: ${data.projectType}`;
    if (data.budget) notes += `\nBudget: ${data.budget}`;
    if (data.appType) notes += `\nApp Type: ${data.appType}`;
    if (data.platform) notes += `\nPlatform: ${data.platform}`;
    if (data.gameType) notes += `\nGame Type: ${data.gameType}`;
    if (data.currentStage) notes += `\nCurrent Stage: ${data.currentStage}`;
    if (data.utm_source || data.utm_medium || data.utm_campaign) {
      notes += `\n\nUTM Parameters:`;
      if (data.utm_source) notes += `\nSource: ${data.utm_source}`;
      if (data.utm_medium) notes += `\nMedium: ${data.utm_medium}`;
      if (data.utm_campaign) notes += `\nCampaign: ${data.utm_campaign}`;
    }
    
    // Parse deal value from budget if provided
    let dealValue = 0;
    if (data.budget) {
      const numbers = data.budget.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        dealValue = parseInt(numbers[0], 10);
      }
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the first pipeline stage (typically "New Lead")
    const { data: firstStage } = await supabase
      .from('pipeline_stages')
      .select('id')
      .eq('is_active', true)
      .order('stage_order')
      .limit(1)
      .single();

    // Create a lead entry first
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert({
        name: fullName,
        email: data.email,
        phone: phoneNumber,
        company: null,
        source: source,
        pipeline_stage_id: firstStage?.id || null,
        deal_value: dealValue,
        notes: notes
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
        description: `Contact form submission from ${fullName} (${data.email})\n\nCategory: ${category}\nPhone: ${phoneNumber || 'Not provided'}\n\nMessage:\n${data.message}\n\nAdditional Details:\n${notes}`,
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
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</p>
          <p><strong>Source:</strong> ${source}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          ${data.projectType ? `<p><strong>Project Type:</strong> ${data.projectType}</p>` : ''}
          ${data.budget ? `<p><strong>Budget:</strong> ${data.budget}</p>` : ''}
          ${data.appType ? `<p><strong>App Type:</strong> ${data.appType}</p>` : ''}
          ${data.platform ? `<p><strong>Platform:</strong> ${data.platform}</p>` : ''}
          ${data.gameType ? `<p><strong>Game Type:</strong> ${data.gameType}</p>` : ''}
          ${data.currentStage ? `<p><strong>Current Stage:</strong> ${data.currentStage}</p>` : ''}
        </div>
        
        <div style="background: #fff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
          <h4 style="margin-top: 0;">Message:</h4>
          <p style="white-space: pre-wrap;">${data.message}</p>
        </div>
        
        ${data.utm_source || data.utm_medium || data.utm_campaign ? `
        <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0;">UTM Tracking:</h4>
          ${data.utm_source ? `<p><strong>Source:</strong> ${data.utm_source}</p>` : ''}
          ${data.utm_medium ? `<p><strong>Medium:</strong> ${data.utm_medium}</p>` : ''}
          ${data.utm_campaign ? `<p><strong>Campaign:</strong> ${data.utm_campaign}</p>` : ''}
        </div>
        ` : ''}
        
        <p>A support ticket (#${ticketData.id.substring(0, 8)}) has been automatically created.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            This email was sent from your 404 Code Lab contact form.<br>
            <a href="mailto:${data.email}">Reply directly to ${data.email}</a>
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
        
        <p>Hi ${fullName.split(' ')[0] || 'there'},</p>
        
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

    // Using Supabase email system - configure SMTP in Dashboard
    console.log("Contact form emails prepared:", {
      adminEmail: "hello@404codelab.com",
      customerEmail: data.email,
      subject
    });

    // For now, just log the emails (configure SMTP in Supabase Dashboard)
    console.log("Contact form processed and emails logged successfully");

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