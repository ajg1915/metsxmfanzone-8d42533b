import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

interface EmailRequest {
  type: "welcome" | "subscription";
  email: string;
  name?: string;
  planType?: string;
  amount?: string;
  transactionDate?: string;
  subscriptionId?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { Resend } = await import("https://esm.sh/resend@4.0.0");
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const { type, email, name, planType, amount, transactionDate, subscriptionId }: EmailRequest = await req.json();
    
    const escapeHtml = (str: string) => {
      return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[m] || m));
    };
    const safeName = escapeHtml(name || "Mets Fan");
    const safeAmount = escapeHtml(amount || "0.00");
    const safeDate = escapeHtml(transactionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    const safeOrderId = subscriptionId ? '****' + escapeHtml(subscriptionId.slice(-4)) : 'N/A';

    let emailContent = "";
    let subject = "";

    if (type === "welcome") {
      subject = "Welcome to MetsXMFanZone.com";
      emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 16px; background-color: #0a0a0a;">
          <div style="max-width: 320px; margin: 0 auto; background-color: #1a1a2e; border-radius: 8px; padding: 20px; border: 1px solid #2a2a3e;">
            <div style="text-align: center; margin-bottom: 16px;">
              <img src="https://clwghkbtkofacsjeyrtk.supabase.co/storage/v1/object/public/email-assets/logo-192.png" alt="MetsXMFanZone" style="width: 85px; height: auto; margin-bottom: 8px; border-radius: 12px;" />
              <div>
                <span style="color: #002D72; font-size: 18px; font-weight: bold;">Mets</span><span style="color: #FF5910; font-size: 18px; font-weight: bold;">XM</span><span style="color: #ffffff; font-size: 18px; font-weight: bold;">FanZone</span>
              </div>
            </div>
            
             <p style="color: #ffffff; text-align: center; font-size: 14px; font-weight: bold; margin: 0 0 12px;">
              Welcome, ${safeName}!
            </p>
            
            <p style="color: #a0a0a0; text-align: center; font-size: 12px; margin: 0 0 16px;">
              Your account has been created successfully.
            </p>
            
            <div style="background: #002D72; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
              <p style="color: #ffffff; font-size: 11px; margin: 0 0 8px; font-weight: bold;">What's Next:</p>
              <ul style="color: #d0d0d0; font-size: 10px; margin: 0; padding-left: 16px;">
                <li style="margin-bottom: 4px;">Choose a subscription plan</li>
                <li style="margin-bottom: 4px;">Watch live streams</li>
                <li style="margin-bottom: 4px;">Connect with fans</li>
              </ul>
            </div>
            
            <p style="color: #FF5910; text-align: center; font-size: 12px; font-weight: bold; margin: 0 0 12px;">
              Let's Go Mets!
            </p>
            
            <div style="border-top: 1px solid #2a2a3e; padding-top: 12px;">
              <p style="color: #555; font-size: 10px; text-align: center; margin: 0 0 10px;">
                The MetsXMFanZone Team
              </p>
              <p style="color: #444; font-size: 9px; text-align: center; margin: 0;">
                <a href="https://metsxmfanzone.com" style="color: #FF5910; text-decoration: none;">metsxmfanzone.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "subscription") {
      const planName = planType === "annual" ? "Annual" : "Premium Monthly";
      const billingCycle = planType === "annual" ? "Yearly" : "Monthly";
      subject = `MetsXMFanZone Receipt - ${planName} Plan`;
      emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 16px; background-color: #0a0a0a;">
          <div style="max-width: 380px; margin: 0 auto; background-color: #1a1a2e; border-radius: 8px; padding: 20px; border: 1px solid #2a2a3e;">
            <div style="text-align: center; margin-bottom: 16px;">
              <img src="https://clwghkbtkofacsjeyrtk.supabase.co/storage/v1/object/public/email-assets/logo-192.png" alt="MetsXMFanZone" style="width: 85px; height: auto; margin-bottom: 8px; border-radius: 12px;" />
              <div>
                <span style="color: #002D72; font-size: 18px; font-weight: bold;">Mets</span><span style="color: #FF5910; font-size: 18px; font-weight: bold;">XM</span><span style="color: #ffffff; font-size: 18px; font-weight: bold;">FanZone</span>
              </div>
            </div>
            
            <p style="color: #4ade80; text-align: center; font-size: 16px; font-weight: bold; margin: 0 0 4px;">
              ✓ Payment Receipt
            </p>
            <p style="color: #a0a0a0; text-align: center; font-size: 12px; margin: 0 0 16px;">
              Hi ${safeName}, here's your payment confirmation.
            </p>
            
            <div style="background: #002D72; padding: 14px; border-radius: 6px; margin-bottom: 12px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #a0a0a0; font-size: 11px; padding: 4px 0;">Plan</td>
                  <td style="color: #ffffff; font-size: 11px; font-weight: bold; text-align: right; padding: 4px 0;">${planName}</td>
                </tr>
                <tr>
                  <td style="color: #a0a0a0; font-size: 11px; padding: 4px 0;">Amount Paid</td>
                  <td style="color: #ffffff; font-size: 11px; font-weight: bold; text-align: right; padding: 4px 0;">$${safeAmount} USD</td>
                </tr>
                <tr>
                  <td style="color: #a0a0a0; font-size: 11px; padding: 4px 0;">Billing Cycle</td>
                  <td style="color: #ffffff; font-size: 11px; font-weight: bold; text-align: right; padding: 4px 0;">${billingCycle}</td>
                </tr>
                <tr>
                  <td style="color: #a0a0a0; font-size: 11px; padding: 4px 0;">Date</td>
                  <td style="color: #ffffff; font-size: 11px; font-weight: bold; text-align: right; padding: 4px 0;">${safeDate}</td>
                </tr>
                <tr>
                  <td style="color: #a0a0a0; font-size: 11px; padding: 4px 0;">Order Ref</td>
                  <td style="color: #ffffff; font-size: 11px; font-weight: bold; text-align: right; padding: 4px 0;">${safeOrderId}</td>
                </tr>
                <tr>
                  <td style="color: #a0a0a0; font-size: 11px; padding: 4px 0;">Payment Method</td>
                  <td style="color: #ffffff; font-size: 11px; font-weight: bold; text-align: right; padding: 4px 0;">PayPal</td>
                </tr>
                <tr>
                  <td style="color: #a0a0a0; font-size: 11px; padding: 4px 0;">Status</td>
                  <td style="color: #4ade80; font-size: 11px; font-weight: bold; text-align: right; padding: 4px 0;">Paid ✓</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #1f1f3a; padding: 10px; border-radius: 6px; margin-bottom: 12px;">
              <p style="color: #FF5910; font-size: 10px; margin: 0 0 6px; font-weight: bold;">Your Benefits:</p>
              <p style="color: #d0d0d0; font-size: 10px; margin: 0; line-height: 1.4;">
                Live streams • Full game replays • Premium content • Ad-free experience • HD streaming
              </p>
            </div>

            <p style="color: #888; font-size: 9px; text-align: center; margin: 0 0 12px;">
              You will also receive a receipt from PayPal. Keep this email for your records.
            </p>
            
            <div style="border-top: 1px solid #2a2a3e; padding-top: 12px;">
              <p style="color: #555; font-size: 10px; text-align: center; margin: 0 0 10px;">
                The MetsXMFanZone Team
              </p>
              <p style="color: #444; font-size: 9px; text-align: center; margin: 0;">
                <a href="https://metsxmfanzone.com" style="color: #FF5910; text-decoration: none;">metsxmfanzone.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "MetsXMFanZone <noreply@metsxmfanzone.com>",
      to: [email],
      subject: subject,
      html: emailContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});