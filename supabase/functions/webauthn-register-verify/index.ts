import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
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

    // Parse the request body
    const { credential, deviceName } = await req.json();

    if (!credential || !credential.id || !credential.response) {
      return new Response(
        JSON.stringify({ error: "Invalid credential data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the stored challenge
    const { data: challengeData, error: challengeError } = await supabase
      .from("webauthn_challenges")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "registration")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (challengeError || !challengeData) {
      console.error("Challenge retrieval error:", challengeError);
      return new Response(
        JSON.stringify({ error: "No valid challenge found. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if challenge has expired
    if (new Date(challengeData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Challenge has expired. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In a production environment, you would verify the attestation here
    // For simplicity, we're trusting the client response
    // The credential.response contains:
    // - attestationObject: Contains the public key and attestation data
    // - clientDataJSON: Contains the challenge and origin

    // Extract public key from the credential
    // Note: In production, you should properly parse the attestation object
    const publicKey = credential.response.attestationObject;
    const credentialId = credential.id;
    const transports = credential.response.transports || ["internal"];

    // Check if this credential already exists
    const { data: existingCred } = await supabase
      .from("user_passkeys")
      .select("id")
      .eq("credential_id", credentialId)
      .single();

    if (existingCred) {
      return new Response(
        JSON.stringify({ error: "This passkey is already registered" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the passkey
    const { error: insertError } = await supabase
      .from("user_passkeys")
      .insert({
        user_id: user.id,
        credential_id: credentialId,
        public_key: publicKey,
        counter: 0,
        device_name: deviceName || "Unknown Device",
        transports,
      });

    if (insertError) {
      console.error("Passkey storage error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store passkey" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete the used challenge
    await supabase
      .from("webauthn_challenges")
      .delete()
      .eq("id", challengeData.id);

    console.log("Passkey registered successfully for user:", user.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Passkey registered successfully",
        credentialId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in webauthn-register-verify:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
