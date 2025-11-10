import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { data: subscribers, error: subscribersError } = await supabase
      .from("newsletter_subscribers")
      .select("email, full_name")
      .eq("is_active", true);

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
      throw new Error("Failed to fetch subscribers");
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscribers found", sent: 0 }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    let successCount = 0;
    let failureCount = 0;

    console.log(`Sending newsletter to ${subscribers.length} subscribers`);

    for (const subscriber of subscribers) {
      try {
        await resend.emails.send({
          from: "MetsXMFanZone <onboarding@resend.dev>",
          to: [subscriber.email],
          subject: subject,
          html: content,
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
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
