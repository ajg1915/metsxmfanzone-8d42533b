import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
      subject = "Welcome to MetsXMFanZone! 🎉";
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #002D72; text-align: center;">Welcome to MetsXMFanZone!</h1>
          <p>Hi ${name || "Mets Fan"},</p>
          <p>Thank you for creating an account with us! We're excited to have you join the MetsXMFanZone community.</p>
          <p>Your account has been successfully created. You can now access exclusive Mets content, live streams, and connect with fellow fans.</p>
          <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin-top: 0;">What's Next?</h3>
            <ul>
              <li>Choose a subscription plan to unlock premium content</li>
              <li>Watch live game streams and replays</li>
              <li>Read the latest Mets news and blog posts</li>
              <li>Connect with other Mets fans in our community</li>
            </ul>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p style="margin-top: 30px;">Let's Go Mets!</p>
          <p><strong>The MetsXMFanZone Team</strong></p>
        </div>
      `;
    } else if (type === "subscription") {
      const planName = planType === "annual" ? "Annual" : "Premium Monthly";
      subject = `Payment Confirmed - ${planName} Plan 🎊`;
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #002D72; text-align: center;">Payment Successful!</h1>
          <p>Hi ${name || "Mets Fan"},</p>
          <p>Thank you for subscribing to MetsXMFanZone! Your payment has been successfully processed.</p>
          <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin-top: 0;">Subscription Details</h3>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Status:</strong> Active</p>
          </div>
          <div style="background-color: #e8f4f8; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin-top: 0;">What You Get:</h3>
            <ul>
              <li>Access to all live game streams</li>
              <li>Exclusive spring training coverage</li>
              <li>Full access to video gallery and replays</li>
              <li>Premium blog content and analysis</li>
              <li>Ad-free browsing experience</li>
              <li>Community access and engagement</li>
            </ul>
          </div>
          <p>Your subscription is now active and you have full access to all premium features!</p>
          <p style="margin-top: 30px;">Thank you for your support!</p>
          <p><strong>The MetsXMFanZone Team</strong></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            Questions? Contact us at support@metsxmfanzone.com
          </p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "MetsXMFanZone <onboarding@resend.dev>",
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
