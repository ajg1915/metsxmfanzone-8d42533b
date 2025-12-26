import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a random challenge as base64url
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

  // Get the origin from the request to determine RP ID
  const origin = req.headers.get("origin") || "";
  let rpId = "localhost";
  
  if (origin.includes("lovable.app")) {
    // Extract the full subdomain for lovable.app previews
    const url = new URL(origin);
    rpId = url.hostname;
  } else if (origin.includes("lovable.dev")) {
    rpId = "lovable.dev";
  } else if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    rpId = "localhost";
  } else {
    // For custom domains, extract the hostname
    try {
      const url = new URL(origin);
      rpId = url.hostname;
    } catch {
      rpId = "localhost";
    }
  }

  try {
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    const { email } = await req.json();
    
    console.log("Received login options request for email:", email);

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the user by email (try both exact match and case-insensitive)
    let profile = null;
    
    // First try exact match
    const { data: exactMatch } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .single();
    
    if (exactMatch) {
      profile = exactMatch;
    } else {
      // Try case-insensitive match
      const { data: lowerMatch } = await supabase
        .from("profiles")
        .select("id, email")
        .ilike("email", email)
        .single();
      profile = lowerMatch;
    }

    console.log("Profile lookup result:", profile ? "found" : "not found");

    if (!profile) {
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

    console.log("Passkeys lookup result:", passkeys?.length || 0, "passkeys found");

    if (passkeysError || !passkeys || passkeys.length === 0) {
      return new Response(
        JSON.stringify({ error: "No passkeys found for this email. Please register a passkey first from your account settings." }),
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

    // Build WebAuthn credential request options in SimpleWebAuthn format
    const options = {
      challenge, // base64url string
      rpId,
      timeout: 60000,
      userVerification: "required",
      allowCredentials: passkeys.map((pk) => ({
        id: pk.credential_id, // Already base64url encoded credential ID
        type: "public-key",
        transports: pk.transports || ["internal"],
      })),
    };

    console.log("Generated login options for email:", email, "with", passkeys.length, "credentials");

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
