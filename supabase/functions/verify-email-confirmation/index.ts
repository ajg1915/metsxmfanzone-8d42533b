import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

    // Normalize email
    const normalizedEmail = email?.toLowerCase().trim();

    console.log("verify-email-confirmation: verifying token for email", normalizedEmail);

    if (!token || !normalizedEmail) {
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

    // Find the token - try exact match first
    let { data: tokenData, error: tokenError } = await supabase
      .from("email_confirmation_tokens")
      .select("*")
      .eq("token", token)
      .is("confirmed_at", null)
      .maybeSingle();

    // If not found, try case-insensitive email match
    if (!tokenData && !tokenError) {
      const result = await supabase
        .from("email_confirmation_tokens")
        .select("*")
        .eq("token", token)
        .ilike("email", normalizedEmail)
        .is("confirmed_at", null)
        .maybeSingle();
      
      tokenData = result.data;
      tokenError = result.error;
    }

    if (tokenError) {
      console.error("verify-email-confirmation: DB error looking up token", tokenError);
      return new Response(
        JSON.stringify({ error: "Database error during verification. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!tokenData) {
      console.error("verify-email-confirmation: token not found or already used for", normalizedEmail);
      
      // Check if there's a confirmed token for this email (already verified)
      const { data: confirmedToken } = await supabase
        .from("email_confirmation_tokens")
        .select("confirmed_at")
        .ilike("email", normalizedEmail)
        .not("confirmed_at", "is", null)
        .order("confirmed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (confirmedToken) {
        // Already verified - let them through
        console.log("verify-email-confirmation: email already verified", normalizedEmail);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Email already confirmed. You can log in.",
            alreadyVerified: true
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

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
        JSON.stringify({ error: "Failed to confirm email. Please try again." }),
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

    // Also update auth.users email_confirmed_at if possible (for Supabase auth compatibility)
    try {
      await supabase.auth.admin.updateUserById(tokenData.user_id, {
        email_confirm: true,
      });
      console.log("verify-email-confirmation: updated auth.users email confirmation");
    } catch (authErr) {
      console.log("verify-email-confirmation: could not update auth.users (may not be needed)", authErr);
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
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
