import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OtpEmailRequest {
  to: string;
  otp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, otp }: OtpEmailRequest = await req.json();

    if (!to || !otp) {
      console.error("Missing required fields: to or otp");
      throw new Error("Email address and OTP code are required");
    }

    console.log(`Sending OTP email to: ${to}`);

    const emailResponse = await resend.emails.send({
      from: "MetsXMFanZone <onboarding@resend.dev>",
      to: [to],
      subject: "Your MetsXMFanZone Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 16px; background-color: #0a0a0a;">
          <div style="max-width: 320px; margin: 0 auto; background-color: #1a1a2e; border-radius: 8px; padding: 20px; border: 1px solid #2a2a3e;">
            <div style="text-align: center; margin-bottom: 16px;">
              <img src="https://metsxmfanzone.com/logo-192.png" alt="MetsXMFanZone" style="width: 60px; height: 60px; margin-bottom: 8px;" />
              <div>
                <span style="color: #002D72; font-size: 18px; font-weight: bold;">Mets</span><span style="color: #FF5910; font-size: 18px; font-weight: bold;">XM</span><span style="color: #ffffff; font-size: 18px; font-weight: bold;">FanZone</span>
              </div>
            </div>
            
            <p style="color: #a0a0a0; text-align: center; font-size: 12px; margin: 0 0 12px;">
              Your verification code:
            </p>
            
            <div style="background: #002D72; padding: 12px 16px; text-align: center; border-radius: 6px; margin-bottom: 12px;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 6px; color: #ffffff; font-family: 'Courier New', monospace;">
                ${otp}
              </span>
            </div>
            
            <p style="color: #666; text-align: center; font-size: 11px; margin: 0 0 12px;">
              Expires in <strong style="color: #FF5910;">5 min</strong>
            </p>
            
            <div style="border-top: 1px solid #2a2a3e; padding-top: 12px;">
              <p style="color: #555; font-size: 10px; text-align: center; margin: 0 0 10px;">
                Didn't request this? Ignore this email.
              </p>
              <div style="text-align: center; margin-bottom: 8px;">
                <a href="https://www.facebook.com/MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
                  <img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" style="width: 20px; height: 20px; opacity: 0.7;" />
                </a>
                <a href="https://twitter.com/MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
                  <img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" style="width: 20px; height: 20px; opacity: 0.7;" />
                </a>
                <a href="https://www.instagram.com/MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
                  <img src="https://cdn-icons-png.flaticon.com/24/733/733558.png" alt="Instagram" style="width: 20px; height: 20px; opacity: 0.7;" />
                </a>
                <a href="https://www.youtube.com/@MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
                  <img src="https://cdn-icons-png.flaticon.com/24/733/733646.png" alt="YouTube" style="width: 20px; height: 20px; opacity: 0.7;" />
                </a>
              </div>
              <p style="color: #444; font-size: 9px; text-align: center; margin: 0;">
                <a href="https://metsxmfanzone.com" style="color: #FF5910; text-decoration: none;">metsxmfanzone.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("OTP email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, response: emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send OTP email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
