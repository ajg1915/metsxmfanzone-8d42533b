import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GameNotificationRequest {
  title: string;
  message: string;
  gameInfo?: {
    opponent?: string;
    date?: string;
    time?: string;
    location?: string;
  };
  notificationType: 'game_alert' | 'score_update' | 'lineup' | 'news' | 'live_stream' | 'event' | 'general';
  targetUsers?: string[];
  url?: string;
}

const getEmailTemplate = (
  title: string, 
  message: string, 
  gameInfo?: GameNotificationRequest['gameInfo'],
  notificationType?: string,
  url?: string
) => {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://metsxmfanzone.com';
  const actionUrl = url ? `${baseUrl}${url}` : baseUrl;
  const logoUrl = 'https://metsxmfanzone.com/logo-192.png';
  
  const gameInfoHtml = gameInfo ? `
    <div style="background: linear-gradient(135deg, #002D72 0%, #FF4500 100%); padding: 20px; border-radius: 12px; margin: 20px 0; color: white;">
      <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #FF4500;">Game Details</h3>
      ${gameInfo.opponent ? `<p style="margin: 5px 0;"><strong style="color: #FF4500;">Opponent:</strong> ${gameInfo.opponent}</p>` : ''}
      ${gameInfo.date ? `<p style="margin: 5px 0;"><strong style="color: #FF4500;">Date:</strong> ${gameInfo.date}</p>` : ''}
      ${gameInfo.time ? `<p style="margin: 5px 0;"><strong style="color: #FF4500;">Time:</strong> ${gameInfo.time}</p>` : ''}
      ${gameInfo.location ? `<p style="margin: 5px 0;"><strong style="color: #FF4500;">Location:</strong> ${gameInfo.location}</p>` : ''}
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #002D72; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 320px; margin: 0 auto; padding: 15px;">
    <div style="text-align: center; padding: 20px 0;">
      <img src="${logoUrl}" alt="MetsXMFanZone" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle;" />
      <span style="color: #FF4500; font-size: 16px; font-weight: bold; margin-left: 6px; vertical-align: middle;">MetsXMFanZone</span>
      <p style="color: #6B7280; margin: 8px 0 0 0; font-size: 11px;">Your Ultimate Mets Experience</p>
    </div>
    <div style="background: linear-gradient(180deg, #1a1f2e 0%, #0f1420 100%); border: 1px solid rgba(255, 69, 0, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
      <div style="text-align: center; margin-bottom: 15px;">
        <img src="${logoUrl}" alt="MetsXMFanZone" style="width: 15px; height: 15px;" />
      </div>
      <h2 style="color: #FF4500; font-size: 18px; text-align: center; margin: 0 0 15px 0;">${title}</h2>
      <p style="color: #D1D5DB; font-size: 13px; line-height: 1.5; text-align: center; margin: 0 0 15px 0;">${message}</p>
      ${gameInfoHtml}
      <div style="text-align: center; margin-top: 20px;">
        <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF4500 0%, #FF6A33 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 13px;">
          View on <span style="color: #002D72; background: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;">MetsXMFanZone</span>
        </a>
      </div>
    </div>
    <div style="text-align: center; padding: 15px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">
      <div style="margin-bottom: 10px;">
        <a href="https://facebook.com/metsxmfanzone" style="color: #FF4500; text-decoration: none; margin: 0 8px; font-size: 11px;">Facebook</a>
        <a href="https://twitter.com/metsxmfanzone" style="color: #FF4500; text-decoration: none; margin: 0 8px; font-size: 11px;">Twitter</a>
        <a href="https://instagram.com/metsxmfanzone" style="color: #FF4500; text-decoration: none; margin: 0 8px; font-size: 11px;">Instagram</a>
        <a href="https://youtube.com/@metsxmfanzone" style="color: #FF4500; text-decoration: none; margin: 0 8px; font-size: 11px;">YouTube</a>
      </div>
      <p style="color: #6B7280; font-size: 10px; margin: 0 0 8px 0;">
        You're receiving this because you enabled notifications on <span style="color: #FF4500; font-weight: bold;">MetsXMFanZone</span>.
      </p>
      <p style="color: #6B7280; font-size: 10px; margin: 0;">
        <a href="${baseUrl}/dashboard" style="color: #FF4500; text-decoration: none;">Manage notification preferences</a>
      </p>
      <p style="color: #4B5563; font-size: 10px; margin: 10px 0 0 0;">
        © ${new Date().getFullYear()} <span style="color: #FF4500;">MetsXMFanZone</span>. All rights reserved.
      </p>
      <p style="margin: 8px 0 0 0;">
        <a href="${baseUrl}" style="color: #002D72; background: #FF4500; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold;">metsxmfanzone.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { title, message, gameInfo, notificationType = 'general', targetUsers, url }: GameNotificationRequest = await req.json();

    if (!title || !message) {
      return new Response(
        JSON.stringify({ error: 'Title and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let query = supabase
      .from('profiles')
      .select('id, email, full_name, email_notifications_enabled, game_notifications_enabled')
      .eq('email_notifications_enabled', true);

    if (['game_alert', 'score_update', 'lineup'].includes(notificationType)) {
      query = query.eq('game_notifications_enabled', true);
    }

    if (targetUsers && targetUsers.length > 0) {
      query = query.in('id', targetUsers);
    }

    const { data: users, error: usersError } = await query;

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users with email notifications enabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending email notifications to ${users.length} users`);
    const emailHtml = getEmailTemplate(title, message, gameInfo, notificationType, url);

    const emailPromises = users.map(async (user) => {
      if (!user.email) return { success: false, userId: user.id, error: 'No email' };

      try {
        const emailResponse = await resend.emails.send({
          from: "MetsXMFanZone <noreply@metsxmfanzone.com>",
          to: [user.email],
          subject: `${title} - MetsXMFanZone`,
          html: emailHtml,
        });
        console.log(`Email sent to ${user.email}:`, { id: emailResponse?.data?.id || '[REDACTED]' });
        return { success: true, userId: user.id };
      } catch (error: any) {
        console.error(`Failed to send email to ${user.email}:`, error.message);
        return { success: false, userId: user.id, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`Emails sent: ${successCount}/${users.length}`);

    return new Response(
      JSON.stringify({ 
        message: `Sent ${successCount} email notifications`,
        total: users.length,
        successful: successCount,
        failed: users.length - successCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error("Error in send-game-notification-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
