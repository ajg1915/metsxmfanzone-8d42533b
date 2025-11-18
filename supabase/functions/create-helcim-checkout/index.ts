import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_PRICES: Record<string, number> = {
  "premium membership": 12.99,
  "annual membership": 129.99,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { planType } = await req.json();

    if (!PLAN_PRICES[planType as keyof typeof PLAN_PRICES]) {
      throw new Error("Invalid plan type");
    }

    const amount = PLAN_PRICES[planType as keyof typeof PLAN_PRICES];
    const helcimApiToken = Deno.env.get("HELCIM_API_TOKEN");
    const helcimAccountId = Deno.env.get("HELCIM_ACCOUNT_ID");

    if (!helcimApiToken || !helcimAccountId) {
      throw new Error("Helcim credentials not configured");
    }

    // Create Helcim checkout session
    const checkoutResponse = await fetch("https://api.helcim.com/v2/helcim-pay/initialize", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-token": helcimApiToken,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        paymentType: "purchase",
        amount: amount,
        currency: "USD",
      }),
    });

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      console.error("Helcim API error:", errorText);
      throw new Error(`Helcim API error: ${checkoutResponse.status} - ${errorText}`);
    }

    const checkoutData = await checkoutResponse.json();
    console.log("Helcim checkout created:", checkoutData);

    // HelcimPay.js returns checkoutToken and secretToken, not a redirect URL
    if (!checkoutData.checkoutToken) {
      throw new Error("Failed to get checkout token from Helcim");
    }

    // Create pending subscription in database
    const { data: subscription, error: dbError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_type: planType,
        status: "pending",
        amount: amount,
        currency: "USD",
        paypal_order_id: checkoutData.checkoutToken, // Store Helcim checkout token
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to create subscription record");
    }

    return new Response(
      JSON.stringify({
        checkoutToken: checkoutData.checkoutToken,
        secretToken: checkoutData.secretToken,
        subscriptionId: subscription.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
