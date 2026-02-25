import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const escapeHtml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

interface GameNotificationRequest {
  title: string;
  message: string;
  gameInfo?: {
    opponent?: string;
    date?: string;
    time?: string;
    location?: string;
    homeScore?: number;
    awayScore?: number;
    homeTeam?: string;
    awayTeam?: string;
    result?: string;
  };
  notificationType: 'game_alert' | 'score_update' | 'lineup' | 'news' | 'live_stream' | 'event' | 'general' | 'final_score';
  targetUsers?: string[];
  url?: string;
  imageUrl?: string;
}

const sendEmail = async (apiKey: string, to: string, subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "MetsXMFanZone <noreply@metsxmfanzone.com>",
      to: [to],
      subject,
      html,
      headers: {
        "List-Unsubscribe": "<mailto:unsubscribe@metsxmfanzone.com>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return await response.json();
};

const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'game_alert': return '⚾';
    case 'score_update': return '📊';
    case 'final_score': return '🏆';
    case 'lineup': return '📋';
    case 'live_stream': return '📺';
    case 'news': return '📰';
    case 'event': return '🎉';
    default: return '🔔';
  }
};

const getEmailTemplate = (
  title: string,
  message: string,
  gameInfo?: GameNotificationRequest['gameInfo'],
  notificationType?: string,
  url?: string,
  imageUrl?: string
) => {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://metsxmfanzone.com';
  const actionUrl = url ? `${baseUrl}${url}` : baseUrl;
  const logoUrl = 'https://clwghkbtkofacsjeyrtk.supabase.co/storage/v1/object/public/email-assets/logo-192.png';
  const icon = getNotificationIcon(notificationType || 'general');
  const isFinal = notificationType === 'final_score';
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);

  // Score box for final score / score update alerts
  const scoreBoxHtml = (gameInfo && (isFinal || notificationType === 'score_update') && gameInfo.homeTeam && gameInfo.awayTeam) ? `
    <div style="background: #0a0e1a; border: 2px solid ${isFinal ? '#FF4500' : 'rgba(255,69,0,0.4)'}; border-radius: 16px; padding: 24px 16px; margin: 20px 0; text-align: center;">
      ${isFinal ? '<div style="background: #FF4500; color: white; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; padding: 4px 14px; border-radius: 20px; display: inline-block; margin-bottom: 16px;">FINAL SCORE</div>' : ''}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
          <td width="42%" style="text-align: center; vertical-align: middle;">
            <div style="color: #9CA3AF; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Away</div>
            <div style="color: white; font-size: 14px; font-weight: 700;">${escapeHtml(gameInfo.awayTeam || '')}</div>
            <div style="color: ${(gameInfo.awayScore ?? 0) > (gameInfo.homeScore ?? 0) ? '#FF4500' : '#D1D5DB'}; font-size: 42px; font-weight: 900; line-height: 1.1; margin-top: 4px;">${gameInfo.awayScore ?? 0}</div>
          </td>
          <td width="16%" style="text-align: center; vertical-align: middle;">
            <div style="color: #4B5563; font-size: 20px; font-weight: 300;">–</div>
          </td>
          <td width="42%" style="text-align: center; vertical-align: middle;">
            <div style="color: #9CA3AF; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Home</div>
            <div style="color: white; font-size: 14px; font-weight: 700;">${escapeHtml(gameInfo.homeTeam || '')}</div>
            <div style="color: ${(gameInfo.homeScore ?? 0) > (gameInfo.awayScore ?? 0) ? '#FF4500' : '#D1D5DB'}; font-size: 42px; font-weight: 900; line-height: 1.1; margin-top: 4px;">${gameInfo.homeScore ?? 0}</div>
          </td>
        </tr>
      </table>
      ${gameInfo.result ? `<div style="color: #FF4500; font-size: 13px; font-weight: 700; margin-top: 14px; letter-spacing: 0.5px;">${escapeHtml(gameInfo.result)}</div>` : ''}
    </div>
  ` : '';

  // Game details card for non-score alerts
  const gameInfoHtml = (gameInfo && !isFinal && notificationType !== 'score_update') ? `
    <div style="background: #0a0e1a; border: 1px solid rgba(255,69,0,0.3); border-radius: 12px; padding: 18px; margin: 20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${gameInfo.opponent ? `<tr><td style="color: #9CA3AF; font-size: 11px; padding: 4px 0; text-transform: uppercase; letter-spacing: 1px;">Opponent</td><td style="color: white; font-size: 13px; padding: 4px 0; text-align: right; font-weight: 600;">${escapeHtml(gameInfo.opponent)}</td></tr>` : ''}
        ${gameInfo.date ? `<tr><td style="color: #9CA3AF; font-size: 11px; padding: 4px 0; text-transform: uppercase; letter-spacing: 1px;">Date</td><td style="color: white; font-size: 13px; padding: 4px 0; text-align: right;">${escapeHtml(gameInfo.date)}</td></tr>` : ''}
        ${gameInfo.time ? `<tr><td style="color: #9CA3AF; font-size: 11px; padding: 4px 0; text-transform: uppercase; letter-spacing: 1px;">First Pitch</td><td style="color: #FF4500; font-size: 13px; padding: 4px 0; text-align: right; font-weight: 700;">${escapeHtml(gameInfo.time)}</td></tr>` : ''}
        ${gameInfo.location ? `<tr><td style="color: #9CA3AF; font-size: 11px; padding: 4px 0; text-transform: uppercase; letter-spacing: 1px;">Venue</td><td style="color: white; font-size: 13px; padding: 4px 0; text-align: right;">${escapeHtml(gameInfo.location)}</td></tr>` : ''}
      </table>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #002D72; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 420px; margin: 0 auto; padding: 20px 12px;">
    
    <!-- Header -->
    <div style="text-align: center; padding: 24px 0 16px 0;">
      <img src="${logoUrl}" alt="MetsXMFanZone" width="40" height="40" style="width: 40px; height: 40px; display: block; margin: 0 auto 6px auto; border-radius: 8px;" />
      <img src="https://clwghkbtkofacsjeyrtk.supabase.co/storage/v1/object/public/email-assets/og-image.png" alt="MetsXMFanZone Logo" style="max-width: 120px; height: auto; display: block; margin: 0 auto 4px auto;" />
      <span style="color: #FF4500; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">MetsXMFanZone</span>
    </div>

    <!-- Main Card -->
    <div style="background: linear-gradient(180deg, #141a2e 0%, #0d1222 100%); border: 1px solid rgba(255,69,0,0.25); border-radius: 16px; padding: 28px 20px; margin-bottom: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
      
      <!-- Icon + Title -->
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="font-size: 36px; margin-bottom: 12px;">${icon}</div>
        <h1 style="color: white; font-size: 20px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.3; letter-spacing: -0.3px;">${safeTitle}</h1>
      </div>

      ${imageUrl ? `<div style="text-align: center; margin: 0 0 18px 0;"><img src="${escapeHtml(imageUrl)}" alt="Alert image" width="360" style="width: 100%; max-width: 360px; height: auto; border-radius: 12px; display: block; margin: 0 auto;" /></div>` : ''}
      
      <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 4px 0;">${safeMessage}</p>

      ${scoreBoxHtml}
      ${gameInfoHtml}

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(actionUrl)}" style="display: inline-block; background: linear-gradient(135deg, #FF4500 0%, #FF6B35 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(255,69,0,0.4);">
          ${isFinal ? 'View Full Recap' : 'Open MetsXMFanZone'}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 16px 0; border-top: 1px solid rgba(255,255,255,0.08);">
      <div style="margin-bottom: 12px;">
        <a href="https://facebook.com/metsxmfanzone" style="color: #9CA3AF; text-decoration: none; margin: 0 6px; font-size: 11px;">Facebook</a>
        <span style="color: #374151;">•</span>
        <a href="https://twitter.com/metsxmfanzone" style="color: #9CA3AF; text-decoration: none; margin: 0 6px; font-size: 11px;">Twitter</a>
        <span style="color: #374151;">•</span>
        <a href="https://instagram.com/metsxmfanzone" style="color: #9CA3AF; text-decoration: none; margin: 0 6px; font-size: 11px;">Instagram</a>
        <span style="color: #374151;">•</span>
        <a href="https://youtube.com/@metsxmfanzone" style="color: #9CA3AF; text-decoration: none; margin: 0 6px; font-size: 11px;">YouTube</a>
      </div>
      <p style="color: #6B7280; font-size: 10px; margin: 0 0 6px 0;">
        You're receiving this because you enabled game notifications on MetsXMFanZone.
      </p>
      <p style="color: #6B7280; font-size: 10px; margin: 0 0 12px 0;">
        <a href="${escapeHtml(baseUrl)}/dashboard" style="color: #FF4500; text-decoration: none;">Manage notification preferences</a>
      </p>
      <p style="color: #4B5563; font-size: 10px; margin: 0;">
        &copy; ${new Date().getFullYear()} MetsXMFanZone. All rights reserved.
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { title, message, gameInfo, notificationType = 'general', targetUsers, url, imageUrl }: GameNotificationRequest = await req.json();

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

    if (['game_alert', 'score_update', 'lineup', 'final_score'].includes(notificationType)) {
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
    const emailHtml = getEmailTemplate(title, message, gameInfo, notificationType, url, imageUrl);

    const emailPromises = users.map(async (user) => {
      if (!user.email) return { success: false, userId: user.id, error: 'No email' };

      try {
        await sendEmail(
          resendApiKey,
          user.email,
          `${title} - MetsXMFanZone`,
          emailHtml
        );
        console.log(`Email sent to [REDACTED]`);
        return { success: true, userId: user.id };
      } catch (error: any) {
        console.error(`Failed to send email to [REDACTED]:`, error.message);
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
