import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import DOMPurify from "https://esm.sh/isomorphic-dompurify@2.16.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

// HTML escape utility for dynamic values
const escapeHtml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Sanitize HTML to prevent XSS in emails
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'img', 'div', 'span', 'table', 'tr', 'td', 'th', 'tbody', 'thead'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'style', 'class', 'width', 'height'],
  });
};

interface EmailRequest {
  subject: string;
  content: string;
  recipientType: "all_users" | "subscribers" | "specific";
  specificEmails?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin access
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

    const { subject, content, recipientType, specificEmails }: EmailRequest = await req.json();

    if (!subject || !content) {
      throw new Error("Subject and content are required");
    }

    // Sanitize HTML content server-side
    const sanitizedContent = sanitizeHtml(content);

    let recipients: { email: string; name?: string }[] = [];

    if (recipientType === "all_users") {
      // Fetch all registered users from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("email, full_name")
        .not("email", "is", null);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw new Error("Failed to fetch registered users");
      }

      recipients = (profiles || [])
        .filter(p => p.email)
        .map(p => ({ email: p.email!, name: p.full_name || undefined }));

    } else if (recipientType === "subscribers") {
      // Fetch newsletter subscribers
      const { data: subscribers, error: subscribersError } = await supabase
        .from("newsletter_subscribers")
        .select("email, full_name")
        .eq("is_active", true);

      if (subscribersError) {
        console.error("Error fetching subscribers:", subscribersError);
        throw new Error("Failed to fetch subscribers");
      }

      recipients = (subscribers || []).map(s => ({ email: s.email, name: s.full_name || undefined }));

    } else if (recipientType === "specific" && specificEmails) {
      recipients = specificEmails.map(email => ({ email }));
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ message: "No recipients found", sent: 0, failed: 0 }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    let successCount = 0;
    let failureCount = 0;

    console.log(`Sending email to ${recipients.length} recipients (type: ${recipientType})`);

    for (const recipient of recipients) {
      try {
        // Escape dynamic values before inserting into sanitized template
        const personalizedContent = sanitizedContent
          .replace(/\{\{name\}\}/g, escapeHtml(recipient.name || "Fan"))
          .replace(/\{\{email\}\}/g, escapeHtml(recipient.email));

        await resend.emails.send({
          from: "MetsXMFanZone <onboarding@resend.dev>",
          to: [recipient.email],
          subject: subject,
          html: personalizedContent,
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to send to [REDACTED]:`, error);
        failureCount++;
      }
    }

    console.log(`Email campaign complete: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        message: `Email sent successfully to ${successCount} recipients`,
        sent: successCount,
        failed: failureCount,
        total: recipients.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-user-email function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
