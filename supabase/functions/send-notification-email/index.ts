import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationEmailRequest {
  event_type: string;
  entity_id: string;
  entity_type: string;
  custom_data?: any;
}

const ADMIN_EMAIL = 'tom@404codelab.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { event_type, entity_id, entity_type, custom_data }: NotificationEmailRequest = await req.json();

    console.log('Processing notification email:', { event_type, entity_id, entity_type });

    let customerEmail: string | null = null;
    let emailData: any = {};
    let templateType = '';
    let sendToAdmin = true;
    let sendToCustomer = true;

    // Fetch entity data and determine recipients based on event type
    switch (event_type) {
      case 'project_created':
      case 'project_request_submitted': {
        const { data: project } = await supabase
          .from('projects')
          .select('*, profiles!projects_customer_id_fkey(email, first_name, last_name)')
          .eq('id', entity_id)
          .single();

        if (project) {
          customerEmail = project.profiles?.email;
          emailData = {
            project_title: project.title,
            project_description: project.description,
            customer_name: `${project.profiles?.first_name} ${project.profiles?.last_name}`,
            project_type: project.project_type,
            budget: project.budget ? `£${project.budget}` : 'Not specified',
          };
          templateType = event_type === 'project_created' ? 'project_request_submitted' : event_type;
        }
        break;
      }

      case 'project_approved':
      case 'project_rejected':
      case 'project_revision_requested': {
        const { data: project } = await supabase
          .from('projects')
          .select('*, profiles!projects_customer_id_fkey(email, first_name, last_name)')
          .eq('id', entity_id)
          .single();

        if (project) {
          customerEmail = project.profiles?.email;
          emailData = {
            project_title: project.title,
            customer_name: `${project.profiles?.first_name} ${project.profiles?.last_name}`,
            approval_notes: project.approval_notes || '',
          };
          templateType = event_type;
          sendToAdmin = false; // Only notify customer
        }
        break;
      }

      case 'ticket_created': {
        const { data: ticket } = await supabase
          .from('tickets')
          .select('*, profiles!tickets_customer_id_fkey(email, first_name, last_name)')
          .eq('id', entity_id)
          .single();

        if (ticket) {
          customerEmail = ticket.profiles?.email;
          emailData = {
            ticket_number: ticket.ticket_number,
            ticket_subject: ticket.subject,
            ticket_description: ticket.description,
            customer_name: `${ticket.profiles?.first_name} ${ticket.profiles?.last_name}`,
            priority: ticket.priority,
            ticket_url: `${Deno.env.get('APP_BASE_URL')}/dashboard`,
          };
          templateType = 'ticket_created';
        }
        break;
      }

      case 'ticket_reply_admin':
      case 'ticket_reply_customer': {
        const { data: comment } = await supabase
          .from('ticket_comments')
          .select('*, tickets!inner(*, profiles!tickets_customer_id_fkey(email, first_name, last_name))')
          .eq('id', entity_id)
          .single();

        if (comment && comment.tickets) {
          customerEmail = comment.tickets.profiles?.email;
          emailData = {
            ticket_number: comment.tickets.ticket_number,
            ticket_subject: comment.tickets.subject,
            response: comment.comment,
            customer_name: `${comment.tickets.profiles?.first_name} ${comment.tickets.profiles?.last_name}`,
            ticket_url: `${Deno.env.get('APP_BASE_URL')}/dashboard`,
          };
          templateType = event_type;
          sendToAdmin = event_type === 'ticket_reply_customer';
          sendToCustomer = event_type === 'ticket_reply_admin';
        }
        break;
      }

      case 'invoice_created':
      case 'invoice_paid':
      case 'invoice_overdue': {
        const { data: invoice } = await supabase
          .from('invoices')
          .select('*, profiles!invoices_customer_id_fkey(email, first_name, last_name)')
          .eq('id', entity_id)
          .single();

        if (invoice) {
          customerEmail = invoice.profiles?.email;
          emailData = {
            invoice_number: invoice.invoice_number,
            amount: `£${invoice.amount}`,
            customer_name: `${invoice.profiles?.first_name} ${invoice.profiles?.last_name}`,
            due_date: invoice.due_date,
            payment_url: `${Deno.env.get('APP_BASE_URL')}/dashboard`,
          };
          templateType = event_type;
        }
        break;
      }

      case 'quote_created':
      case 'quote_accepted':
      case 'quote_rejected': {
        const { data: quote } = await supabase
          .from('quotes')
          .select('*, profiles!quotes_customer_id_fkey(email, first_name, last_name)')
          .eq('id', entity_id)
          .single();

        if (quote) {
          customerEmail = quote.profiles?.email;
          emailData = {
            quote_number: quote.quote_number,
            amount: `£${quote.total_amount}`,
            customer_name: `${quote.profiles?.first_name} ${quote.profiles?.last_name}`,
            valid_until: quote.valid_until,
            quote_url: `${Deno.env.get('APP_BASE_URL')}/dashboard`,
          };
          templateType = event_type;
          sendToAdmin = event_type !== 'quote_created';
        }
        break;
      }

      case 'subscription_created':
      case 'subscription_renewed':
      case 'subscription_cancelled':
      case 'subscription_payment_failed': {
        const { data: subscription } = await supabase
          .from('customer_subscriptions')
          .select('*, profiles(email, first_name, last_name), subscription_plans(name)')
          .eq('id', entity_id)
          .single();

        if (subscription) {
          customerEmail = subscription.profiles?.email;
          emailData = {
            customer_name: `${subscription.profiles?.first_name} ${subscription.profiles?.last_name}`,
            plan_name: subscription.subscription_plans?.name,
            next_billing_date: subscription.next_billing_date,
          };
          templateType = event_type;
        }
        break;
      }

      case 'appointment_created':
      case 'appointment_updated':
      case 'appointment_cancelled':
      case 'appointment_reminder': {
        const { data: appointment } = await supabase
          .from('call_bookings')
          .select('*, profiles(email, first_name, last_name)')
          .eq('id', entity_id)
          .single();

        if (appointment) {
          customerEmail = appointment.profiles?.email;
          emailData = {
            customer_name: `${appointment.profiles?.first_name} ${appointment.profiles?.last_name}`,
            appointment_date: appointment.call_date,
            appointment_time: appointment.call_time,
            meeting_url: appointment.notes || '',
          };
          templateType = event_type;
        }
        break;
      }

      default:
        console.warn('Unknown event type:', event_type);
        return new Response(JSON.stringify({ success: false, error: 'Unknown event type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const emailPromises: Promise<any>[] = [];

    // Send email to customer
    if (sendToCustomer && customerEmail) {
      emailPromises.push(
        supabase.functions.invoke('send-email', {
          body: {
            to: customerEmail,
            subject: `${emailData.project_title || emailData.ticket_subject || 'Notification'}`,
            content: generateEmailContent(event_type, emailData, 'customer'),
            template_type: templateType,
            template_data: emailData,
          }
        })
      );
    }

    // Send email to admin
    if (sendToAdmin) {
      emailPromises.push(
        supabase.functions.invoke('send-email', {
          body: {
            to: ADMIN_EMAIL,
            subject: `[ADMIN] ${emailData.project_title || emailData.ticket_subject || 'Notification'}`,
            content: generateEmailContent(event_type, emailData, 'admin'),
            template_type: templateType,
            template_data: emailData,
          }
        })
      );
    }

    await Promise.all(emailPromises);

    console.log('Notification emails sent successfully');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending notification email:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateEmailContent(eventType: string, data: any, recipient: 'admin' | 'customer'): string {
  const isAdmin = recipient === 'admin';
  
  const baseStyle = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">404 Code Lab</h1>
        </div>
  `;

  const footer = `
      </div>
      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
        <p>404 Code Lab | Professional Development Services</p>
        <p>If you have any questions, contact us at tom@404codelab.com</p>
      </div>
    </div>
  `;

  let content = '';

  switch (eventType) {
    case 'project_created':
    case 'project_request_submitted':
      content = isAdmin 
        ? `<h2>New Project Request</h2><p>A new project request has been submitted by ${data.customer_name}.</p><p><strong>Title:</strong> ${data.project_title}</p><p><strong>Type:</strong> ${data.project_type}</p><p><strong>Budget:</strong> ${data.budget}</p>`
        : `<h2>Project Request Received</h2><p>Hi ${data.customer_name},</p><p>Thank you for submitting your project request. We have received it and will review it shortly.</p><p><strong>Project:</strong> ${data.project_title}</p>`;
      break;
    
    case 'ticket_created':
      content = isAdmin
        ? `<h2>New Support Ticket #${data.ticket_number}</h2><p>A new support ticket has been created by ${data.customer_name}.</p><p><strong>Subject:</strong> ${data.ticket_subject}</p><p><strong>Priority:</strong> ${data.priority}</p>`
        : `<h2>Support Ticket Created</h2><p>Hi ${data.customer_name},</p><p>Your support ticket #${data.ticket_number} has been created successfully.</p><p><strong>Subject:</strong> ${data.ticket_subject}</p>`;
      break;

    case 'invoice_created':
      content = `<h2>New Invoice #${data.invoice_number}</h2><p>Hi ${data.customer_name},</p><p>A new invoice has been generated for ${data.amount}.</p><p><strong>Due Date:</strong> ${data.due_date}</p>`;
      break;

    case 'invoice_paid':
      content = isAdmin
        ? `<h2>Invoice Payment Received</h2><p>Invoice #${data.invoice_number} has been marked as paid for ${data.customer_name}.</p>`
        : `<h2>Payment Received</h2><p>Hi ${data.customer_name},</p><p>Thank you! We have received your payment for invoice #${data.invoice_number}.</p>`;
      break;

    default:
      content = `<h2>Notification</h2><p>You have a new notification regarding ${data.project_title || data.ticket_subject || 'your account'}.</p>`;
  }

  return baseStyle + content + footer;
}
