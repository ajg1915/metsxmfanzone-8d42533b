import { createClient } from "npm:@supabase/supabase-js@2";
import { decode } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

const PLAN_PRICES = {
  premium: 12.99,
  annual: 129.99
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header received:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No authorization header');
    }

    // Extract and decode the JWT token
    const token = authHeader.replace('Bearer ', '');
    let userId: string;
    
    try {
      const [_header, payload, _signature] = decode(token);
      userId = (payload as { sub: string }).sub;
      console.log('Decoded user ID:', userId);
    } catch (decodeError) {
      console.error('JWT decode error:', decodeError);
      throw new Error('Invalid token');
    }

    if (!userId) {
      throw new Error('No user ID in token');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role key for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { planType } = await req.json();
    
    if (!PLAN_PRICES[planType as keyof typeof PLAN_PRICES]) {
      throw new Error('Invalid plan type');
    }

    const amount = PLAN_PRICES[planType as keyof typeof PLAN_PRICES];
    
    // Create Helcim checkout session
    const helcimApiToken = Deno.env.get('HELCIM_API_TOKEN');
    
    if (!helcimApiToken) {
      throw new Error('Helcim credentials not configured');
    }

    console.log('Creating Helcim checkout for amount:', amount);

    const helcimResponse = await fetch('https://api.helcim.com/v2/helcim-pay/initialize', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-token': helcimApiToken,
      },
      body: JSON.stringify({
        paymentType: 'purchase',
        amount: amount,
        currency: 'USD',
      }),
    });

    if (!helcimResponse.ok) {
      const errorData = await helcimResponse.text();
      console.error('Helcim API error:', helcimResponse.status, errorData.substring(0, 200));
      throw new Error(`Helcim API error: ${helcimResponse.status}`);
    }

    const contentType = helcimResponse.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const textBody = await helcimResponse.text();
      console.error('Helcim returned non-JSON:', contentType, textBody.substring(0, 200));
      throw new Error('Helcim returned unexpected response format');
    }

    const helcimData = await helcimResponse.json();
    console.log('Helcim response received');
    
    // Store pending subscription
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: planType,
        status: 'pending',
        amount: amount,
        currency: 'USD',
        paypal_order_id: helcimData.checkoutToken,
      });

    if (insertError) {
      console.error('Error inserting subscription:', insertError);
      throw insertError;
    }

    console.log('Subscription created successfully');

    return new Response(
      JSON.stringify({
        checkoutToken: helcimData.checkoutToken,
        secretToken: helcimData.secretToken,
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
