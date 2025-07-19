import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  to: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  invoiceType: 'invoice' | 'quote';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, customerName, invoiceNumber, amount, dueDate, invoiceType }: InvoiceEmailRequest = await req.json();

    const subject = invoiceType === 'invoice' 
      ? `New Invoice ${invoiceNumber} - Amount $${amount}`
      : `New Quote ${invoiceNumber} - Amount $${amount}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          ${invoiceType === 'invoice' ? 'New Invoice' : 'New Quote'}
        </h1>
        
        <p>Dear ${customerName},</p>
        
        <p>We hope this email finds you well. ${invoiceType === 'invoice' ? 'A new invoice has been generated' : 'We have prepared a quote'} for your recent request.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #007bff;">${invoiceType === 'invoice' ? 'Invoice' : 'Quote'} Details:</h3>
          <p><strong>${invoiceType === 'invoice' ? 'Invoice' : 'Quote'} Number:</strong> ${invoiceNumber}</p>
          <p><strong>Amount:</strong> $${amount}</p>
          ${dueDate ? `<p><strong>${invoiceType === 'invoice' ? 'Due Date' : 'Valid Until'}:</strong> ${new Date(dueDate).toLocaleDateString()}</p>` : ''}
        </div>
        
        ${invoiceType === 'invoice' ? `
          <p>Please review the invoice and proceed with payment by the due date. If you have any questions or concerns, please don't hesitate to reach out.</p>
        ` : `
          <p>Please review the quote and let us know if you would like to proceed. This quote is valid until the specified date.</p>
        `}
        
        <p>Thank you for your business!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            404 Code Lab Team<br>
            <a href="mailto:contact@404codelab.com">contact@404codelab.com</a>
          </p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "404 Code Lab <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
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