import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

// Server-side plan pricing - never trust client
const PLAN_PRICES: Record<string, number> = {
  'premium': 12.99,
  'annual': 129.99,
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { planType } = await req.json();

    if (!planType) {
      return new Response(
        JSON.stringify({ error: 'Plan type is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate plan type and get server-side price
    const amount = PLAN_PRICES[planType];
    if (!amount) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET');
    const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Use sandbox for testing

    // Get PayPal access token
    const authResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    const authData = await authResponse.json();
    console.log('PayPal auth response: [REDACTED]');

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount.toString(),
          },
          description: `MetsXMFanZone ${planType} subscription`,
        }],
        application_context: {
          return_url: 'https://metsxmfanzone.com/payment-success',
          cancel_url: 'https://metsxmfanzone.com/plans',
        },
      }),
    });

    const orderData = await orderResponse.json();
    console.log('PayPal order response:', { status: orderData.status || '[UNKNOWN]', id: '[REDACTED]' });

    if (!orderResponse.ok) {
      throw new Error(`PayPal error: ${JSON.stringify(orderData)}`);
    }

    // Create pending subscription record
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
      user_id: user.id,
        plan_type: planType,
        status: 'pending',
        paypal_order_id: orderData.id,
        amount: amount,
        currency: 'USD',
        payment_method: 'paypal',
      });

    if (insertError) {
      console.error('Error creating subscription:', insertError);
      throw insertError;
    }

    // Only return the approval URL - orderId stays server-side in the subscription record
    const approvalUrl = orderData.links.find((l: any) => l.rel === 'approve')?.href;
    console.log('Payment order created successfully');
    
    return new Response(
      JSON.stringify({ approvalUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});