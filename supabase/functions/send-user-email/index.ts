import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
        const personalizedContent = content
          .replace(/\{\{name\}\}/g, recipient.name || "Fan")
          .replace(/\{\{email\}\}/g, recipient.email);

        await resend.emails.send({
          from: "MetsXMFanZone <onboarding@resend.dev>",
          to: [recipient.email],
          subject: subject,
          html: personalizedContent,
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${recipient.email}:`, error);
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