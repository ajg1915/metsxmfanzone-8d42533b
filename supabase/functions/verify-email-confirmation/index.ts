import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

interface VerifyRequest {
  token: string;
  email: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  console.log("verify-email-confirmation: received request", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { token, email } = body as VerifyRequest;

    console.log("verify-email-confirmation: verifying token for email", email);

    if (!token || !email) {
      console.error("verify-email-confirmation: missing token or email");
      return new Response(
        JSON.stringify({ error: "Token and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the token (case-insensitive email match for safety)
    const { data: tokenData, error: tokenError } = await supabase
      .from("email_confirmation_tokens")
      .select("*")
      .eq("token", token)
      .ilike("email", email)
      .is("confirmed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenError) {
      console.error("verify-email-confirmation: DB error looking up token", tokenError);
      return new Response(
        JSON.stringify({ error: "Database error during verification" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!tokenData) {
      console.error("verify-email-confirmation: token not found or already used");
      return new Response(
        JSON.stringify({ error: "Invalid or expired confirmation link. Please request a new one." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.error("verify-email-confirmation: token expired at", tokenData.expires_at);
      return new Response(
        JSON.stringify({ error: "This confirmation link has expired. Please request a new one." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark token as confirmed
    const { error: updateTokenError } = await supabase
      .from("email_confirmation_tokens")
      .update({ confirmed_at: new Date().toISOString() })
      .eq("id", tokenData.id);

    if (updateTokenError) {
      console.error("verify-email-confirmation: error updating token", updateTokenError);
      return new Response(
        JSON.stringify({ error: "Failed to confirm email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update user's profile to mark email as verified
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ email_verified: true })
      .eq("id", tokenData.user_id);

    if (profileError) {
      console.error("verify-email-confirmation: error updating profile", profileError);
      // Don't fail the whole operation, just log it
    }

    console.log("verify-email-confirmation: SUCCESS for user", tokenData.user_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email confirmed successfully",
        userId: tokenData.user_id 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("verify-email-confirmation: unhandled error", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});