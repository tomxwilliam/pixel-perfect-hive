import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-MARK-INVOICE-PAID] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verify caller is authenticated and is admin
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } }
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !user) {
      logStep("Unauthorized: No user found");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Use service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user is admin
    const { data: hasAdminRole, error: roleError } = await supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" });

    if (roleError || !hasAdminRole) {
      logStep("Access denied: User is not an admin");
      return new Response(JSON.stringify({ error: "Access denied: Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invoiceNumber, paymentMethod = "manual", notes } = await req.json();

    if (!invoiceNumber) {
      throw new Error("Invoice number is required");
    }

    logStep("Request data received", { invoiceNumber, paymentMethod, notes });

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, invoice_number, status, customer_id, amount")
      .eq("invoice_number", invoiceNumber)
      .single();

    if (invoiceError || !invoice) {
      logStep("Invoice not found", { invoiceNumber });
      throw new Error("Invoice not found");
    }

    if (invoice.status === "paid") {
      logStep("Invoice already paid", { invoiceNumber });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Invoice is already marked as paid",
        invoice 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Updating invoice to paid", { invoiceId: invoice.id });

    // Update invoice status
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", invoice.id);

    if (updateError) {
      logStep("Error updating invoice", { error: updateError });
      throw updateError;
    }

    logStep("Invoice updated successfully");

    // Send notification to customer
    await supabase.rpc("send_notification", {
      p_user_id: invoice.customer_id,
      p_title: "Payment Confirmed",
      p_message: `Your payment for invoice ${invoice.invoice_number} has been confirmed. ${notes ? `Note: ${notes}` : ''}`,
      p_type: "success",
      p_category: "billing",
      p_related_id: invoice.id,
      p_created_by: user.id,
    });

    // Log activity
    await supabase.rpc("log_activity", {
      p_user_id: invoice.customer_id,
      p_actor_id: user.id,
      p_action: "invoice_manually_paid",
      p_entity_type: "invoice",
      p_entity_id: invoice.id,
      p_description: `Invoice ${invoice.invoice_number} manually marked as paid by admin ${user.email}`,
      p_new_values: {
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
        notes: notes || null,
      },
    });

    logStep("Notification and activity log created");

    return new Response(JSON.stringify({
      success: true,
      message: "Invoice marked as paid successfully",
      invoice: {
        ...invoice,
        status: "paid",
        paid_at: new Date().toISOString(),
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
