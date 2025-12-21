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
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #002D72; margin: 0; font-size: 28px;">MetsXMFanZone</h1>
              <p style="color: #FF5910; margin: 5px 0 0; font-size: 14px;">Two-Factor Authentication</p>
            </div>
            
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Verify Your Identity</h2>
            
            <p style="color: #555; text-align: center; margin-bottom: 30px;">
              Enter the following code to complete your sign-in:
            </p>
            
            <div style="background: linear-gradient(135deg, #002D72 0%, #003087 100%); padding: 25px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #ffffff; font-family: 'Courier New', monospace;">
                ${otp}
              </span>
            </div>
            
            <p style="color: #888; text-align: center; font-size: 14px; margin-top: 30px;">
              This code expires in <strong>5 minutes</strong>.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              If you didn't request this code, you can safely ignore this email.<br>
              Someone may have entered your email address by mistake.
            </p>
          </div>
          
          <p style="color: #aaa; font-size: 11px; text-align: center; margin-top: 20px;">
            © ${new Date().getFullYear()} MetsXMFanZone. All rights reserved.
          </p>
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
