import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';

// Domain email templates
import {
  DomainRegistrationConfirmation,
  DomainTransferInitiated,
  DomainTransferCompleted,
  DomainRenewalReminder30Days,
  DomainRenewalReminder7Days,
  DomainExpiredNotice,
  DomainRedemptionNotice
} from './_templates/domain-emails.tsx';

// Hosting email templates
import {
  HostingAccountSetup,
  HostingRenewalReminder30Days,
  HostingRenewalReminder7Days,
  HostingExpiredNotice,
  ResourceUsageAlert
} from './_templates/hosting-emails.tsx';

// Technical email templates
import {
  NameserverUpdate,
  EmailHostingSetup
} from './_templates/technical-emails.tsx';

// Billing email templates
import {
  InvoicePaymentReceipt,
  FailedPaymentRetry,
  AutoRenewalConfirmation
} from './_templates/billing-emails.tsx';

// Security & Support email templates
import {
  AccountVerification,
  PasswordReset,
  HostingSuspension,
  HostingTermination,
  SupportTicketOpened,
  SupportTicketUpdate,
  SupportTicketClosed
} from './_templates/security-support-emails.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  template: string;
  data: any;
  from?: string;
  subject?: string;
}

const emailTemplates = {
  // Domain emails
  'domain-registration-confirmation': {
    component: DomainRegistrationConfirmation,
    subject: (data: any) => `Domain registration confirmed for ${data.domain_name}!`
  },
  'domain-transfer-initiated': {
    component: DomainTransferInitiated,
    subject: (data: any) => `Domain transfer initiated for ${data.domain_name}`
  },
  'domain-transfer-completed': {
    component: DomainTransferCompleted,
    subject: (data: any) => `Domain transfer completed for ${data.domain_name}!`
  },
  'domain-renewal-reminder-30': {
    component: DomainRenewalReminder30Days,
    subject: (data: any) => `Domain renewal reminder - ${data.domain_name} expires in 30 days`
  },
  'domain-renewal-reminder-7': {
    component: DomainRenewalReminder7Days,
    subject: (data: any) => `URGENT: ${data.domain_name} expires in 7 days!`
  },
  'domain-expired': {
    component: DomainExpiredNotice,
    subject: (data: any) => `EXPIRED: ${data.domain_name} requires immediate attention`
  },
  'domain-redemption': {
    component: DomainRedemptionNotice,
    subject: (data: any) => `Final notice: ${data.domain_name} in redemption period`
  },
  
  // Hosting emails
  'hosting-account-setup': {
    component: HostingAccountSetup,
    subject: (data: any) => `Welcome! Your hosting account is ready`
  },
  'hosting-renewal-reminder-30': {
    component: HostingRenewalReminder30Days,
    subject: (data: any) => `Hosting renewal reminder - ${data.domain_name} expires in 30 days`
  },
  'hosting-renewal-reminder-7': {
    component: HostingRenewalReminder7Days,
    subject: (data: any) => `URGENT: Hosting for ${data.domain_name} expires in 7 days!`
  },
  'hosting-expired': {
    component: HostingExpiredNotice,
    subject: (data: any) => `OFFLINE: Hosting expired for ${data.domain_name}`
  },
  'resource-usage-alert': {
    component: ResourceUsageAlert,
    subject: (data: any) => `Resource usage alert - ${data.domain_name} at ${data.usage_percentage}%`
  },
  
  // Technical emails
  'nameserver-update': {
    component: NameserverUpdate,
    subject: (data: any) => `Nameserver update confirmed for ${data.domain_name}`
  },
  'email-hosting-setup': {
    component: EmailHostingSetup,
    subject: (data: any) => `Email hosting setup complete for ${data.domain_name}`
  },
  
  // Billing emails
  'invoice-payment-receipt': {
    component: InvoicePaymentReceipt,
    subject: (data: any) => `Payment received - Invoice ${data.invoice_number}`
  },
  'failed-payment-retry': {
    component: FailedPaymentRetry,
    subject: (data: any) => `Payment failed - Please retry for invoice ${data.invoice_number}`
  },
  'auto-renewal-confirmation': {
    component: AutoRenewalConfirmation,
    subject: (data: any) => `Auto-renewal successful - ${data.service_description}`
  },
  
  // Security & Support emails
  'account-verification': {
    component: AccountVerification,
    subject: () => `Please verify your account`
  },
  'password-reset': {
    component: PasswordReset,
    subject: () => `Password reset request`
  },
  'hosting-suspension': {
    component: HostingSuspension,
    subject: (data: any) => `URGENT: Account suspended - ${data.domain_name}`
  },
  'hosting-termination': {
    component: HostingTermination,
    subject: (data: any) => `Final notice: Account termination - ${data.domain_name}`
  },
  'support-ticket-opened': {
    component: SupportTicketOpened,
    subject: (data: any) => `Support ticket #${data.ticket_number} opened`
  },
  'support-ticket-update': {
    component: SupportTicketUpdate,
    subject: (data: any) => `Support ticket #${data.ticket_number} updated`
  },
  'support-ticket-closed': {
    component: SupportTicketClosed,
    subject: (data: any) => `Support ticket #${data.ticket_number} closed`
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, template, data, from, subject: customSubject }: EmailRequest = await req.json();

    if (!to || !template) {
      throw new Error("Missing required fields: to, template");
    }

    const emailTemplate = emailTemplates[template as keyof typeof emailTemplates];
    if (!emailTemplate) {
      throw new Error(`Unknown email template: ${template}`);
    }

    // Add default values to data
    const emailData = {
      company_name: "Your Hosting Company",
      support_email: "support@yourhostingcompany.com",
      support_phone: "+1 (555) 123-4567",
      login_url: "https://cp.yourhostingcompany.com",
      ...data
    };

    // Generate subject line
    const subject = customSubject || emailTemplate.subject(emailData);

    // Render the React email template
    const html = await renderAsync(
      React.createElement(emailTemplate.component, emailData)
    );

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: from || "Your Hosting Company <noreply@yourhostingcompany.com>",
      to: [to],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", {
      template,
      to,
      subject,
      emailId: emailResponse.data?.id
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        template,
        subject
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-domain-hosting-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);