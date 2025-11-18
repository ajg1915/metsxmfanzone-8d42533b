import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLAN_PRICES = {
  premium: 9.99,
  annual: 99.99
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header received:', authHeader ? 'present' : 'missing');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('getUser result:', { user: user?.id, error: userError?.message });
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`);
    }

    const { planType } = await req.json();
    
    if (!PLAN_PRICES[planType as keyof typeof PLAN_PRICES]) {
      throw new Error('Invalid plan type');
    }

    const amount = PLAN_PRICES[planType as keyof typeof PLAN_PRICES];
    
    // Create Helcim checkout session
    const helcimApiToken = Deno.env.get('HELCIM_API_TOKEN');
    const helcimAccountId = Deno.env.get('HELCIM_ACCOUNT_ID');
    
    if (!helcimApiToken || !helcimAccountId) {
      throw new Error('Helcim credentials not configured');
    }

    const helcimResponse = await fetch('https://api.helcim.com/v2/payment/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-token': helcimApiToken,
      },
      body: JSON.stringify({
        accountId: helcimAccountId,
        amount: amount,
        currency: 'USD',
        description: `${planType === 'premium' ? 'Premium Monthly' : 'Premium Annual'} Subscription`,
        customerCode: user.id,
        invoiceNumber: `SUB-${user.id}-${Date.now()}`,
        successUrl: `${req.headers.get('origin')}/paypal-success?session_id={CHECKOUT_ID}`,
        cancelUrl: `${req.headers.get('origin')}/plans`,
      }),
    });

    if (!helcimResponse.ok) {
      const errorData = await helcimResponse.text();
      console.error('Helcim API error:', errorData);
      throw new Error(`Helcim API error: ${helcimResponse.status}`);
    }

    const helcimData = await helcimResponse.json();
    
    // Store pending subscription
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_type: planType,
        status: 'pending',
        amount: amount,
        currency: 'USD',
        paypal_order_id: helcimData.checkoutId, // Reusing this field for Helcim checkout ID
      });

    if (insertError) {
      console.error('Error inserting subscription:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        checkoutId: helcimData.checkoutId,
        checkoutUrl: helcimData.checkoutUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-helcim-checkout:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
