import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, any>;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook signature
    const hookSecret = Deno.env.get("AUTH_HOOK_SECRET");
    if (!hookSecret) {
      throw new Error("AUTH_HOOK_SECRET not configured");
    }

    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const wh = new Webhook(hookSecret);
    
    let authData: AuthEmailRequest;
    try {
      authData = wh.verify(payload, headers) as AuthEmailRequest;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user, email_data } = authData;
    console.log("Auth email hook triggered:", {
      email: user.email,
      action: email_data.email_action_type,
    });

    // Initialize Supabase client (with service role for database access)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Map email action types to template types
    const templateTypeMap: Record<string, string> = {
      signup: "auth_confirmation",
      invite: "auth_confirmation",
      magiclink: "auth_magic_link",
      recovery: "auth_password_reset",
      email_change: "auth_email_change",
    };

    const templateType = templateTypeMap[email_data.email_action_type] || "auth_confirmation";

    // Fetch email template from database
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_type", templateType)
      .eq("is_active", true)
      .single();

    if (templateError || !template) {
      console.error("Template fetch error:", templateError);
      throw new Error(`Template not found for type: ${templateType}`);
    }

    // Build confirmation URL
    const confirmationUrl = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(email_data.redirect_to)}`;

    // Prepare template data
    const templateData: Record<string, string> = {
      confirmation_url: confirmationUrl,
      reset_url: confirmationUrl,
      magic_link_url: confirmationUrl,
      company_name: "404 Code Lab",
      user_email: user.email,
      new_email: user.email,
    };

    // Replace template variables
    let emailSubject = template.subject;
    let emailBody = template.body_html;

    Object.entries(templateData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      emailSubject = emailSubject.replace(regex, value);
      emailBody = emailBody.replace(regex, value);
    });

    // Call the send-email edge function to actually send the email
    const { data: emailResult, error: emailError } = await supabase.functions.invoke(
      "send-email",
      {
        body: {
          to: user.email,
          subject: emailSubject,
          content: emailBody,
          template_type: templateType,
        },
      }
    );

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw emailError;
    }

    console.log("Auth email sent successfully:", {
      to: user.email,
      template: templateType,
      result: emailResult,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Auth email hook error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
