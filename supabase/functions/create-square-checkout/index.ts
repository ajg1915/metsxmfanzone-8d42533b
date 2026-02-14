import { createClient } from "npm:@supabase/supabase-js@2";
import { decode } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

const PLAN_PRICES = {
  premium: 1299, // in cents
  annual: 12999,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    let userId: string;

    try {
      const [_header, payload, _signature] = decode(token);
      userId = (payload as { sub: string }).sub;
    } catch {
      throw new Error('Invalid token');
    }

    if (!userId) throw new Error('No user ID in token');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { planType } = await req.json();

    if (!PLAN_PRICES[planType as keyof typeof PLAN_PRICES]) {
      throw new Error('Invalid plan type');
    }

    const amountCents = PLAN_PRICES[planType as keyof typeof PLAN_PRICES];
    const amountDollars = amountCents / 100;

    const squareAccessToken = Deno.env.get('SQUARE_ACCESS_TOKEN');
    const squareLocationId = Deno.env.get('SQUARE_LOCATION_ID');

    if (!squareAccessToken || !squareLocationId) {
      throw new Error('Square credentials not configured');
    }

    // Create a Square Checkout link via the Checkout API
    const idempotencyKey = crypto.randomUUID();
    const squareResponse = await fetch('https://connect.squareup.com/v2/online-checkout/payment-links', {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${squareAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        quick_pay: {
          name: `MetsXMFanZone ${planType === 'annual' ? 'Annual' : 'Premium'} Plan`,
          price_money: {
            amount: amountCents,
            currency: 'USD',
          },
          location_id: squareLocationId,
        },
        checkout_options: {
          redirect_url: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.supabase.co')}/functions/v1/verify-square-payment?userId=${userId}&planType=${planType}`,
        },
      }),
    });

    if (!squareResponse.ok) {
      const errorData = await squareResponse.text();
      console.error('Square API error:', errorData);
      throw new Error(`Square API error: ${squareResponse.status}`);
    }

    const squareData = await squareResponse.json();
    const paymentLink = squareData.payment_link;
    console.log('Square payment link created successfully');

    // Store pending subscription
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: planType,
        status: 'pending',
        amount: amountDollars,
        currency: 'USD',
        payment_method: 'square',
        paypal_order_id: paymentLink.id, // reuse field for Square link ID
      });

    if (insertError) {
      console.error('Error inserting subscription:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        checkoutUrl: paymentLink.url,
        orderId: paymentLink.order_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-square-checkout:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
