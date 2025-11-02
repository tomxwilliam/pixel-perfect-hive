import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  to?: string;
  customer_email?: string;
  customerName?: string;
  customer_name?: string;
  invoiceNumber?: string;
  invoice_number?: string;
  amount: number;
  dueDate?: string;
  due_date?: string;
  invoiceType?: 'invoice' | 'quote';
  invoice_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: InvoiceEmailRequest = await req.json();
    
    // Handle different request formats for backward compatibility
    const to = requestData.to || requestData.customer_email;
    const customerName = requestData.customerName || requestData.customer_name;
    const invoiceNumber = requestData.invoiceNumber || requestData.invoice_number;
    const amount = requestData.amount;
    const dueDate = requestData.dueDate || requestData.due_date;
    const invoiceType = requestData.invoiceType || 'invoice';

    if (!to || !customerName || !invoiceNumber) {
      throw new Error('Missing required fields: email, customer name, or invoice number');
    }

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

    // Using Supabase email system - configure SMTP in Dashboard
    console.log("Invoice email prepared:", { to, subject, invoiceType });
    
    const emailResponse = {
      success: true,
      message: 'Email logged - configure SMTP in Supabase Dashboard for actual delivery',
      to,
      subject
    };

    console.log("Invoice email logged successfully:", emailResponse);

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