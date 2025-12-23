import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, name, planType, amount }: EmailRequest = await req.json();

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
              <img src="https://metsxmfanzone.com/logo-192.png" alt="MetsXMFanZone" style="width: 60px; height: 60px; margin-bottom: 8px;" />
              <div>
                <span style="color: #002D72; font-size: 18px; font-weight: bold;">Mets</span><span style="color: #FF5910; font-size: 18px; font-weight: bold;">XM</span><span style="color: #ffffff; font-size: 18px; font-weight: bold;">FanZone</span>
              </div>
            </div>
            
            <p style="color: #ffffff; text-align: center; font-size: 14px; font-weight: bold; margin: 0 0 12px;">
              Welcome, ${name || "Mets Fan"}!
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
      `;
    } else if (type === "subscription") {
      const planName = planType === "annual" ? "Annual" : "Premium Monthly";
      subject = `Payment Confirmed - ${planName} Plan`;
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
              <img src="https://metsxmfanzone.com/logo-192.png" alt="MetsXMFanZone" style="width: 60px; height: 60px; margin-bottom: 8px;" />
              <div>
                <span style="color: #002D72; font-size: 18px; font-weight: bold;">Mets</span><span style="color: #FF5910; font-size: 18px; font-weight: bold;">XM</span><span style="color: #ffffff; font-size: 18px; font-weight: bold;">FanZone</span>
              </div>
            </div>
            
            <p style="color: #4ade80; text-align: center; font-size: 14px; font-weight: bold; margin: 0 0 12px;">
              Payment Successful!
            </p>
            
            <p style="color: #a0a0a0; text-align: center; font-size: 12px; margin: 0 0 16px;">
              Hi ${name || "Mets Fan"}, your subscription is active.
            </p>
            
            <div style="background: #002D72; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: #a0a0a0; font-size: 11px;">Plan:</span>
                <span style="color: #ffffff; font-size: 11px; font-weight: bold;">${planName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: #a0a0a0; font-size: 11px;">Amount:</span>
                <span style="color: #ffffff; font-size: 11px; font-weight: bold;">$${amount}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #a0a0a0; font-size: 11px;">Status:</span>
                <span style="color: #4ade80; font-size: 11px; font-weight: bold;">Active</span>
              </div>
            </div>
            
            <div style="background: #1f1f3a; padding: 10px; border-radius: 6px; margin-bottom: 12px;">
              <p style="color: #FF5910; font-size: 10px; margin: 0 0 6px; font-weight: bold;">Your Benefits:</p>
              <p style="color: #d0d0d0; font-size: 10px; margin: 0; line-height: 1.4;">
                Live streams • Replays • Premium content • Ad-free
              </p>
            </div>
            
            <div style="border-top: 1px solid #2a2a3e; padding-top: 12px;">
              <p style="color: #555; font-size: 10px; text-align: center; margin: 0 0 10px;">
                The MetsXMFanZone Team
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
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "MetsXMFanZone.com <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: emailContent,
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
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
