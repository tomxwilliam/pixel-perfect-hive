import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Running billing automation tasks...');

    // Get overdue invoices (due date passed and still pending)
    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate()); // Today

    const { data: overdueInvoices, error: overdueError } = await supabase
      .from('invoices')
      .select(`
        *,
        profiles!invoices_customer_id_fkey(first_name, last_name, email)
      `)
      .eq('status', 'pending')
      .lt('due_date', overdueDate.toISOString().split('T')[0]);

    if (overdueError) {
      console.error('Error fetching overdue invoices:', overdueError);
    }

    // Send reminders for overdue invoices
    if (overdueInvoices && overdueInvoices.length > 0) {
      console.log(`Found ${overdueInvoices.length} overdue invoices`);
      
      for (const invoice of overdueInvoices) {
        try {
          // Send overdue notification
          await supabase.rpc('send_notification', {
            p_user_id: invoice.customer_id,
            p_title: 'Invoice Overdue',
            p_message: `Invoice ${invoice.invoice_number} for £${invoice.amount} is overdue. Please make payment to avoid service interruption.`,
            p_type: 'warning',
            p_category: 'billing',
            p_related_id: invoice.id,
            p_action_url: `/dashboard?invoice=${invoice.id}`
          });

          // Check if invoice is significantly overdue (7+ days)
          const dueDate = new Date(invoice.due_date);
          const daysPastDue = Math.floor((overdueDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysPastDue >= 7) {
            // Send suspension warning
            await supabase.rpc('send_notification', {
              p_user_id: invoice.customer_id,
              p_title: 'Service Suspension Warning',
              p_message: `Invoice ${invoice.invoice_number} is ${daysPastDue} days overdue. Services may be suspended if payment is not received within 48 hours.`,
              p_type: 'error',
              p_category: 'billing',
              p_related_id: invoice.id
            });

            // If 14+ days overdue, suspend services
            if (daysPastDue >= 14) {
              console.log(`Suspending services for invoice ${invoice.invoice_number}`);
              
              // Suspend hosting services
              const { data: hostingSubscriptions } = await supabase
                .from('hosting_subscriptions')
                .select('id')
                .eq('invoice_id', invoice.id);

              if (hostingSubscriptions) {
                for (const subscription of hostingSubscriptions) {
                  try {
                    await supabase.functions.invoke('hosting-provision', {
                      body: {
                        subscriptionId: subscription.id,
                        action: 'suspend'
                      }
                    });
                  } catch (error) {
                    console.error('Error suspending hosting:', error);
                  }
                }
              }

              // Send suspension notification
              await supabase.rpc('send_notification', {
                p_user_id: invoice.customer_id,
                p_title: 'Services Suspended',
                p_message: `Services have been suspended due to non-payment of invoice ${invoice.invoice_number}. Please make payment to restore services.`,
                p_type: 'error',
                p_category: 'billing',
                p_related_id: invoice.id
              });
            }
          }

        } catch (error) {
          console.error(`Error processing overdue invoice ${invoice.id}:`, error);
        }
      }
    }

    // Check for upcoming renewals (hosting subscriptions)
    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + 7); // 7 days ahead

    const { data: upcomingRenewals, error: renewalError } = await supabase
      .from('hosting_subscriptions')
      .select(`
        *,
        hosting_packages(*),
        profiles!hosting_subscriptions_customer_id_fkey(first_name, last_name, email)
      `)
      .eq('status', 'active')
      .lte('next_billing_date', renewalDate.toISOString().split('T')[0]);

    if (renewalError) {
      console.error('Error fetching upcoming renewals:', renewalError);
    }

    // Create renewal invoices
    if (upcomingRenewals && upcomingRenewals.length > 0) {
      console.log(`Found ${upcomingRenewals.length} upcoming renewals`);
      
      for (const subscription of upcomingRenewals) {
        try {
          const amount = subscription.billing_cycle === 'annual' 
            ? (subscription.hosting_packages.annual_price || subscription.hosting_packages.monthly_price * 12)
            : subscription.hosting_packages.monthly_price;

          // Create renewal invoice
          const invoiceNumber = `INV-REN-${Date.now()}`;
          const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
              customer_id: subscription.customer_id,
              invoice_number: invoiceNumber,
              amount: amount,
              status: 'pending',
              due_date: subscription.next_billing_date,
              project_id: null // This is for hosting renewal
            })
            .select()
            .single();

          if (invoiceError) {
            console.error('Error creating renewal invoice:', invoiceError);
            continue;
          }

          // Update subscription with new invoice
          await supabase
            .from('hosting_subscriptions')
            .update({ 
              invoice_id: invoice.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id);

          // Send renewal notification
          await supabase.rpc('send_notification', {
            p_user_id: subscription.customer_id,
            p_title: 'Hosting Renewal Due',
            p_message: `Your ${subscription.hosting_packages.package_name} hosting subscription is due for renewal. Invoice ${invoiceNumber} for £${amount} has been generated.`,
            p_type: 'info',
            p_category: 'billing',
            p_related_id: invoice.id,
            p_action_url: `/dashboard?invoice=${invoice.id}`
          });

        } catch (error) {
          console.error(`Error processing renewal for subscription ${subscription.id}:`, error);
        }
      }
    }

    // Update next billing dates for processed renewals
    for (const subscription of upcomingRenewals || []) {
      const nextBillingDate = new Date(subscription.next_billing_date);
      if (subscription.billing_cycle === 'annual') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      } else {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      }

      await supabase
        .from('hosting_subscriptions')
        .update({ 
          next_billing_date: nextBillingDate.toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
    }

    return new Response(JSON.stringify({ 
      success: true,
      processedOverdue: overdueInvoices?.length || 0,
      processedRenewals: upcomingRenewals?.length || 0,
      message: 'Billing automation completed successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in billing-automation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);