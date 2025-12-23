import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
  targetUsers?: string[]; // Optional: specific user IDs to notify
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
  
  const gameInfoHtml = gameInfo ? `
    <div style="background: linear-gradient(135deg, #002D72 0%, #FF5910 100%); padding: 20px; border-radius: 12px; margin: 20px 0; color: white;">
      <h3 style="margin: 0 0 10px 0; font-size: 18px;">Game Details</h3>
      ${gameInfo.opponent ? `<p style="margin: 5px 0;"><strong>Opponent:</strong> ${gameInfo.opponent}</p>` : ''}
      ${gameInfo.date ? `<p style="margin: 5px 0;"><strong>Date:</strong> ${gameInfo.date}</p>` : ''}
      ${gameInfo.time ? `<p style="margin: 5px 0;"><strong>Time:</strong> ${gameInfo.time}</p>` : ''}
      ${gameInfo.location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${gameInfo.location}</p>` : ''}
    </div>
  ` : '';

  const getNotificationIcon = () => {
    switch (notificationType) {
      case 'game_alert': return '⚾';
      case 'score_update': return '📊';
      case 'lineup': return '📋';
      case 'news': return '📰';
      case 'live_stream': return '🔴';
      case 'event': return '📅';
      default: return '🔔';
    }
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0A0F1C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="text-align: center; padding: 30px 0;">
          <h1 style="color: #FF5910; font-size: 28px; margin: 0;">MetsXM FanZone</h1>
          <p style="color: #6B7280; margin: 10px 0 0 0;">Your Ultimate Mets Experience</p>
        </div>
        
        <!-- Main Content -->
        <div style="background: linear-gradient(180deg, #1a1f2e 0%, #0f1420 100%); border: 1px solid rgba(255, 89, 16, 0.3); border-radius: 16px; padding: 30px; margin-bottom: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 48px;">${getNotificationIcon()}</span>
          </div>
          
          <h2 style="color: #FFFFFF; font-size: 24px; text-align: center; margin: 0 0 20px 0;">${title}</h2>
          
          <p style="color: #D1D5DB; font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 20px 0;">
            ${message}
          </p>
          
          ${gameInfoHtml}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF5910 0%, #FF7A3D 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View on MetsXM FanZone
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="color: #6B7280; font-size: 12px; margin: 0 0 10px 0;">
            You're receiving this because you enabled game notifications on MetsXM FanZone.
          </p>
          <p style="color: #6B7280; font-size: 12px; margin: 0;">
            <a href="${baseUrl}/dashboard" style="color: #FF5910; text-decoration: none;">Manage notification preferences</a>
          </p>
          <p style="color: #4B5563; font-size: 11px; margin: 15px 0 0 0;">
            © ${new Date().getFullYear()} MetsXM FanZone. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      title, 
      message, 
      gameInfo, 
      notificationType = 'general',
      targetUsers,
      url 
    }: GameNotificationRequest = await req.json();

    if (!title || !message) {
      return new Response(
        JSON.stringify({ error: 'Title and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get users who have email notifications enabled
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, email_notifications_enabled, game_notifications_enabled')
      .eq('email_notifications_enabled', true);

    // Filter for game notifications if applicable
    if (['game_alert', 'score_update', 'lineup'].includes(notificationType)) {
      query = query.eq('game_notifications_enabled', true);
    }

    // Filter by specific users if provided
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

    // Send emails to all eligible users
    const emailPromises = users.map(async (user) => {
      if (!user.email) return { success: false, userId: user.id, error: 'No email' };

      try {
        const emailResponse = await resend.emails.send({
          from: "MetsXM FanZone <notifications@metsxmfanzone.com>",
          to: [user.email],
          subject: `${title} - MetsXM FanZone`,
          html: emailHtml,
        });

        console.log(`Email sent to ${user.email}:`, emailResponse);
        return { success: true, userId: user.id, email: user.email };
      } catch (error: any) {
        console.error(`Failed to send email to ${user.email}:`, error);
        return { success: false, userId: user.id, email: user.email, error: error.message };
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
};

serve(handler);