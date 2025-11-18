import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { checkoutToken } = await req.json();

    if (!checkoutToken) {
      throw new Error("Checkout token is required");
    }

    const helcimApiToken = Deno.env.get("HELCIM_API_TOKEN");

    if (!helcimApiToken) {
      throw new Error("Helcim credentials not configured");
    }

    // Verify the payment with Helcim
    const verifyResponse = await fetch(`https://api.helcim.com/v2/payment/checkout/${checkoutToken}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api-token": helcimApiToken,
      },
    });

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error("Helcim verification error:", errorText);
      throw new Error(`Helcim verification failed: ${verifyResponse.status}`);
    }

    const paymentData = await verifyResponse.json();
    console.log("Helcim payment data:", paymentData);

    // Check if payment was successful
    if (paymentData.status !== "APPROVED") {
      throw new Error("Payment was not approved");
    }

    // Find the subscription by checkout token
    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("paypal_order_id", checkoutToken) // Stored in paypal_order_id field
      .eq("user_id", user.id)
      .single();

    if (fetchError || !subscription) {
      throw new Error("Subscription not found");
    }

    // Calculate end date based on plan type
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    if (subscription.plan_type === "premium") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (subscription.plan_type === "annual") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Update subscription to active
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        paypal_subscription_id: paymentData.transactionId, // Store Helcim transaction ID
      })
      .eq("id", subscription.id);

    if (updateError) {
      console.error("Failed to update subscription:", updateError);
      throw new Error("Failed to update subscription");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        subscription: {
          plan_type: subscription.plan_type,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }
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
