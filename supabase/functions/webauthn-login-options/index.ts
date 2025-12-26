import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a random challenge
function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the user by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (profileError || !profile) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ error: "No passkeys found for this email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the user's passkeys
    const { data: passkeys, error: passkeysError } = await supabase
      .from("user_passkeys")
      .select("credential_id, transports")
      .eq("user_id", profile.id);

    if (passkeysError || !passkeys || passkeys.length === 0) {
      return new Response(
        JSON.stringify({ error: "No passkeys found for this email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a challenge
    const challenge = generateChallenge();

    // Store the challenge in the database
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes
    const { error: challengeError } = await supabase
      .from("webauthn_challenges")
      .insert({
        user_id: profile.id,
        email: email.toLowerCase(),
        challenge,
        type: "authentication",
        expires_at: expiresAt,
      });

    if (challengeError) {
      console.error("Challenge storage error:", challengeError);
      return new Response(
        JSON.stringify({ error: "Failed to create challenge" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean up expired challenges
    await supabase
      .from("webauthn_challenges")
      .delete()
      .lt("expires_at", new Date().toISOString());

    // Build WebAuthn credential request options
    const rpId = new URL(supabaseUrl).hostname.includes("supabase")
      ? "lovable.dev" // Production
      : "localhost"; // Development

    const options = {
      challenge,
      rpId,
      timeout: 60000,
      userVerification: "required",
      allowCredentials: passkeys.map((pk) => ({
        id: pk.credential_id,
        type: "public-key",
        transports: pk.transports || ["internal"],
      })),
    };

    console.log("Generated login options for email:", email);

    return new Response(
      JSON.stringify({ 
        options,
        userId: profile.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in webauthn-login-options:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
