import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { ConfirmationEmail } from "./_templates/confirmation-email.tsx";
import { PasswordResetEmail } from "./_templates/password-reset-email.tsx";
import { MagicLinkEmail } from "./_templates/magic-link-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailData {
  user: {
    email: string;
    id: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuthEmailData = await req.json();
    console.log("Auth email request:", payload.email_data.email_action_type);

    const { user, email_data } = payload;
    const { token, token_hash, redirect_to, email_action_type, site_url } = email_data;

    let html: string;
    let subject: string;

    // Generate email based on type
    switch (email_action_type) {
      case "signup":
        subject = "Confirm your email address";
        html = await renderAsync(
          React.createElement(ConfirmationEmail, {
            confirmationUrl: `${site_url}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to}`,
            userEmail: user.email,
          })
        );
        break;

      case "magiclink":
        subject = "Your magic link to sign in";
        html = await renderAsync(
          React.createElement(MagicLinkEmail, {
            magicLinkUrl: `${site_url}/auth/v1/verify?token=${token_hash}&type=magiclink&redirect_to=${redirect_to}`,
            token: token,
            userEmail: user.email,
          })
        );
        break;

      case "recovery":
        subject = "Reset your password";
        html = await renderAsync(
          React.createElement(PasswordResetEmail, {
            resetUrl: `${redirect_to}?token=${token_hash}&type=recovery`,
            userEmail: user.email,
          })
        );
        break;

      default:
        throw new Error(`Unknown email action type: ${email_action_type}`);
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "404 Code Lab <hello@404codelab.com>",
      to: [user.email],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending auth email:", error);
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
