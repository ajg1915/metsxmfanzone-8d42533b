import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import * as ammonia from "https://deno.land/x/ammonia@0.3.1/mod.ts";

await ammonia.init();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const escapeHtml = (str: string): string => {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m] || m));
};

// Sanitize HTML to prevent XSS in emails
const sanitizeHtml = (html: string): string => {
  try {
    return ammonia.clean(html);
  } catch (error) {
    console.error("Error sanitizing HTML:", error);
    // Fallback: escape all HTML if sanitization fails
    return escapeHtml(html);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      throw new Error("Admin access required");
    }

    const { subject, content } = await req.json();

    if (!subject || !content) {
      throw new Error("Subject and content are required");
    }

    // Sanitize HTML content server-side
    const sanitizedContent = sanitizeHtml(content);

    // Fetch newsletter subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("newsletter_subscribers")
      .select("email, full_name")
      .eq("is_active", true);

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
    }

    // Fetch all registered users with emails
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .not("email", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Combine and deduplicate by email (lowercase)
    const emailMap = new Map<string, { email: string; full_name?: string }>();
    
    // Add subscribers first
    for (const sub of subscribers || []) {
      if (sub.email) {
        emailMap.set(sub.email.toLowerCase(), { email: sub.email, full_name: sub.full_name || undefined });
      }
    }
    
    // Add registered users (won't overwrite existing)
    for (const profile of profiles || []) {
      if (profile.email && !emailMap.has(profile.email.toLowerCase())) {
        emailMap.set(profile.email.toLowerCase(), { email: profile.email, full_name: profile.full_name || undefined });
      }
    }

    const allRecipients = Array.from(emailMap.values());

    if (allRecipients.length === 0) {
      return new Response(
        JSON.stringify({ message: "No recipients found", sent: 0 }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    let successCount = 0;
    let failureCount = 0;

    console.log(`Sending newsletter to ${allRecipients.length} recipients (${subscribers?.length || 0} subscribers + ${profiles?.length || 0} users, deduplicated)`);

    for (const recipient of allRecipients) {
      try {
        const result = await resend.emails.send({
          from: "MetsXM Fanzone <noreply@metsxmfanzone.com>",
          to: [recipient.email],
          subject: subject,
          html: sanitizedContent,
          headers: {
            "List-Unsubscribe": "<mailto:unsubscribe@metsxmfanzone.com>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });

        if ((result as any)?.error) {
          throw (result as any).error;
        }

        successCount++;
      } catch (error) {
        console.error(`Failed to send to [REDACTED]:`, error);
        failureCount++;
      }
    }

    console.log(`Newsletter sent: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        message: `Newsletter sent successfully to ${successCount} subscribers`,
        sent: successCount,
        failed: failureCount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});