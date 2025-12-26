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
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from the auth token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get device name from request body
    const { deviceName } = await req.json().catch(() => ({}));

    // Get user's email from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    const userEmail = profile?.email || user.email || "";
    const userName = profile?.full_name || userEmail.split("@")[0];

    // Get existing passkeys for this user to exclude them
    const { data: existingPasskeys } = await supabase
      .from("user_passkeys")
      .select("credential_id")
      .eq("user_id", user.id);

    // Generate a challenge
    const challenge = generateChallenge();

    // Store the challenge in the database
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes
    const { error: challengeError } = await supabase
      .from("webauthn_challenges")
      .insert({
        user_id: user.id,
        challenge,
        type: "registration",
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

    // Build WebAuthn credential creation options
    const rpId = new URL(supabaseUrl).hostname.includes("supabase")
      ? "lovable.dev" // Production
      : "localhost"; // Development

    const options = {
      challenge,
      rp: {
        name: "MetsXMFanZone",
        id: rpId,
      },
      user: {
        id: user.id,
        name: userEmail,
        displayName: userName,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },  // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Use device's built-in authenticator
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "none",
      excludeCredentials: existingPasskeys?.map((pk) => ({
        id: pk.credential_id,
        type: "public-key",
        transports: ["internal"],
      })) || [],
    };

    console.log("Generated registration options for user:", user.id);

    return new Response(
      JSON.stringify({ options, deviceName }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in webauthn-register-options:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
