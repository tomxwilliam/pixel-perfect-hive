import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExportRequest {
  startDate?: string;
  endDate?: string;
  format: 'csv' | 'excel';
  includeCustomers: boolean;
  includeProjects: boolean;
  includeTimeTracking: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      startDate, 
      endDate, 
      format, 
      includeCustomers, 
      includeProjects, 
      includeTimeTracking 
    }: ExportRequest = await req.json()

    console.log('Export request received:', { 
      startDate, 
      endDate, 
      format, 
      includeCustomers, 
      includeProjects, 
      includeTimeTracking 
    });

    // Build date filter for queries
    const dateFilter = startDate && endDate ? 
      `created_at.gte.${startDate}.and.created_at.lte.${endDate}` : '';

    let csvData = '';
    let recordCount = 0;

    // Export header
    csvData += `"404 Code Lab - Accounting Export Generated ${new Date().toISOString()}"\n\n`;

    // Summary Section
    csvData += '"=== FINANCIAL SUMMARY ==="\n';
    csvData += '"Type","Count","Total Amount","Currency"\n';

    // Get invoice summary
    let invoiceQuery = supabaseClient
      .from('invoices')
      .select('amount, status, created_at');
    
    if (startDate && endDate) {
      invoiceQuery = invoiceQuery
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    const { data: invoices } = await invoiceQuery;
    const totalInvoiceAmount = invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
    const paidInvoices = invoices?.filter(inv => inv.status === 'paid').length || 0;
    const pendingInvoices = invoices?.filter(inv => inv.status === 'pending').length || 0;

    csvData += `"Invoices Total",${invoices?.length || 0},"£${totalInvoiceAmount.toFixed(2)}","GBP"\n`;
    csvData += `"Invoices Paid",${paidInvoices},"",""\n`;
    csvData += `"Invoices Pending",${pendingInvoices},"",""\n`;

    // Get quote summary
    let quoteQuery = supabaseClient
      .from('quotes')
      .select('amount, status, created_at');
    
    if (startDate && endDate) {
      quoteQuery = quoteQuery
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    const { data: quotes } = await quoteQuery;
    const totalQuoteAmount = quotes?.reduce((sum, quote) => sum + Number(quote.amount), 0) || 0;

    csvData += `"Quotes Total",${quotes?.length || 0},"£${totalQuoteAmount.toFixed(2)}","GBP"\n`;
    csvData += '\n';

    // Detailed Invoices Section
    csvData += '"=== INVOICES DETAIL ==="\n';
    csvData += '"Invoice ID","Invoice Number","Customer Email","Amount","Status","Due Date","Paid Date","Created Date","Project ID"\n';

    if (invoices && invoices.length > 0) {
      const { data: invoiceDetails } = await supabaseClient
        .from('invoices')
        .select(`
          id,
          invoice_number,
          amount,
          status,
          due_date,
          paid_at,
          created_at,
          project_id,
          profiles!customer_id (email)
        `)
        .gte('created_at', startDate || '1970-01-01')
        .lte('created_at', endDate || '2099-12-31');

      for (const invoice of invoiceDetails || []) {
        const customerEmail = invoice.profiles?.email || 'N/A';
        csvData += `"${invoice.id}","${invoice.invoice_number}","${customerEmail}","£${Number(invoice.amount).toFixed(2)}","${invoice.status}","${invoice.due_date || ''}","${invoice.paid_at || ''}","${invoice.created_at}","${invoice.project_id || ''}"\n`;
        recordCount++;
      }
    }
    csvData += '\n';

    // Detailed Quotes Section
    csvData += '"=== QUOTES DETAIL ==="\n';
    csvData += '"Quote ID","Quote Number","Customer Email","Amount","Status","Valid Until","Created Date","Project ID","Description"\n';

    if (quotes && quotes.length > 0) {
      const { data: quoteDetails } = await supabaseClient
        .from('quotes')
        .select(`
          id,
          quote_number,
          amount,
          status,
          valid_until,
          created_at,
          project_id,
          description,
          profiles!customer_id (email)
        `)
        .gte('created_at', startDate || '1970-01-01')
        .lte('created_at', endDate || '2099-12-31');

      for (const quote of quoteDetails || []) {
        const customerEmail = quote.profiles?.email || 'N/A';
        const description = (quote.description || '').replace(/"/g, '""'); // Escape quotes
        csvData += `"${quote.id}","${quote.quote_number}","${customerEmail}","£${Number(quote.amount).toFixed(2)}","${quote.status}","${quote.valid_until || ''}","${quote.created_at}","${quote.project_id || ''}","${description}"\n`;
        recordCount++;
      }
    }
    csvData += '\n';

    // Customer Information (if requested)
    if (includeCustomers) {
      csvData += '"=== CUSTOMER INFORMATION ==="\n';
      csvData += '"Customer ID","Email","First Name","Last Name","Company","Phone","Role","Created Date"\n';

      const { data: customers } = await supabaseClient
        .from('profiles')
        .select('*')
        .neq('role', 'admin');

      for (const customer of customers || []) {
        csvData += `"${customer.id}","${customer.email}","${customer.first_name || ''}","${customer.last_name || ''}","${customer.company_name || ''}","${customer.phone || ''}","${customer.role}","${customer.created_at}"\n`;
        recordCount++;
      }
      csvData += '\n';
    }

    // Project Financial Data (if requested)
    if (includeProjects) {
      csvData += '"=== PROJECT FINANCIAL DATA ==="\n';
      csvData += '"Project ID","Project Title","Customer Email","Budget","Status","Completion %","Created Date","Project Type"\n';

      let projectQuery = supabaseClient
        .from('projects')
        .select(`
          id,
          title,
          budget,
          status,
          completion_percentage,
          created_at,
          project_type,
          profiles!customer_id (email)
        `);

      if (startDate && endDate) {
        projectQuery = projectQuery
          .gte('created_at', startDate)
          .lte('created_at', endDate);
      }

      const { data: projects } = await projectQuery;

      for (const project of projects || []) {
        const customerEmail = project.profiles?.email || 'N/A';
        const title = (project.title || '').replace(/"/g, '""');
        csvData += `"${project.id}","${title}","${customerEmail}","£${Number(project.budget || 0).toFixed(2)}","${project.status}","${project.completion_percentage || 0}%","${project.created_at}","${project.project_type}"\n`;
        recordCount++;
      }
      csvData += '\n';
    }

    // Time Tracking Data (if requested)
    if (includeTimeTracking) {
      csvData += '"=== TIME TRACKING & BILLABLE HOURS ==="\n';
      csvData += '"Log ID","Ticket ID","Project ID","User Email","Hours","Billable","Description","Date","Rate"\n';

      let timeLogQuery = supabaseClient
        .from('ticket_time_logs')
        .select(`
          id,
          ticket_id,
          hours_logged,
          billable,
          description,
          created_at,
          profiles!user_id (email),
          tickets!ticket_id (project_id)
        `);

      if (startDate && endDate) {
        timeLogQuery = timeLogQuery
          .gte('created_at', startDate)
          .lte('created_at', endDate);
      }

      const { data: timeLogs } = await timeLogQuery;

      for (const log of timeLogs || []) {
        const userEmail = log.profiles?.email || 'N/A';
        const projectId = log.tickets?.project_id || '';
        const description = (log.description || '').replace(/"/g, '""');
        csvData += `"${log.id}","${log.ticket_id}","${projectId}","${userEmail}","${log.hours_logged}","${log.billable ? 'Yes' : 'No'}","${description}","${log.created_at}","£50.00"\n`;
        recordCount++;
      }
      csvData += '\n';
    }

    // Domains & Hosting Revenue
    csvData += '"=== DOMAINS & HOSTING REVENUE ==="\n';
    csvData += '"Type","Domain/Service","Customer Email","Price","Status","Registration/Start Date","Expiry Date","Billing Cycle"\n';

    // Domains
    let domainQuery = supabaseClient
      .from('domains')
      .select(`
        domain_name,
        price,
        status,
        registration_date,
        expiry_date,
        profiles!customer_id (email)
      `);

    if (startDate && endDate) {
      domainQuery = domainQuery
        .gte('registration_date', startDate.split('T')[0])
        .lte('registration_date', endDate.split('T')[0]);
    }

    const { data: domains } = await domainQuery;

    for (const domain of domains || []) {
      const customerEmail = domain.profiles?.email || 'N/A';
      csvData += `"Domain","${domain.domain_name}","${customerEmail}","£${Number(domain.price).toFixed(2)}","${domain.status}","${domain.registration_date || ''}","${domain.expiry_date || ''}","Annual"\n`;
      recordCount++;
    }

    // Hosting
    const { data: hostingSubscriptions } = await supabaseClient
      .from('hosting_subscriptions')
      .select(`
        hosting_packages (package_name, monthly_price, annual_price),
        billing_cycle,
        status,
        created_at,
        expires_at,
        profiles!customer_id (email)
      `);

    for (const hosting of hostingSubscriptions || []) {
      const customerEmail = hosting.profiles?.email || 'N/A';
      const packageName = hosting.hosting_packages?.package_name || 'Unknown';
      const price = hosting.billing_cycle === 'annual' 
        ? hosting.hosting_packages?.annual_price 
        : hosting.hosting_packages?.monthly_price;
      csvData += `"Hosting","${packageName}","${customerEmail}","£${Number(price || 0).toFixed(2)}","${hosting.status}","${hosting.created_at}","${hosting.expires_at || ''}","${hosting.billing_cycle}"\n`;
      recordCount++;
    }

    csvData += '\n';
    csvData += '"=== END OF EXPORT ==="\n';
    csvData += `"Total Records: ${recordCount}"\n`;
    csvData += `"Export Generated: ${new Date().toISOString()}"\n`;

    console.log(`Export completed successfully. Total records: ${recordCount}`);

    return new Response(
      JSON.stringify({ 
        csvData, 
        recordCount,
        message: 'Export generated successfully' 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )

  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate accounting export' 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  }
})