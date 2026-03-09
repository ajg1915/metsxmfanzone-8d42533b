import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    
    // Resend sends webhook events with type, data fields
    const eventType = payload.type;
    const data = payload.data || {};

    console.log(`Resend webhook received: ${eventType}`);

    const { error } = await supabase.from("email_events").insert({
      event_type: eventType,
      email_id: data.email_id || data.id || null,
      email_to: Array.isArray(data.to) ? data.to.join(", ") : (data.to || null),
      email_from: data.from || null,
      subject: data.subject || null,
      event_data: data,
    });

    if (error) {
      console.error("Failed to store email event:", error.message);
      return new Response(
        JSON.stringify({ error: "Failed to store event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Resend webhook error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
