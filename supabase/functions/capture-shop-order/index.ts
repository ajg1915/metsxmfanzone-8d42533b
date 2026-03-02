import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { paypalOrderId } = await req.json();

    if (!paypalOrderId) {
      return new Response(
        JSON.stringify({ error: 'PayPal order ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find our order record
    const { data: order, error: orderError } = await supabase
      .from('shop_orders')
      .select('*, shop_products(title, stock_quantity)')
      .eq('paypal_order_id', paypalOrderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (order.status === 'paid') {
      return new Response(
        JSON.stringify({ success: true, order: { id: order.id, status: 'paid' } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')!;
    const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET')!;
    const PAYPAL_API = Deno.env.get('PAYPAL_BASE_URL') || 'https://api-m.paypal.com';

    // Get access token
    const authRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)}`,
      },
      body: 'grant_type=client_credentials',
    });
    const authData = await authRes.json();

    // Capture the payment
    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureRes.json();
    console.log('PayPal capture result:', { status: captureData.status || '[UNKNOWN]', id: '[REDACTED]' });

    if (!captureRes.ok || captureData.status !== 'COMPLETED') {
      // Check if already captured
      if (captureData.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED') {
        await supabase.from('shop_orders').update({ status: 'paid' }).eq('id', order.id);
        return new Response(
          JSON.stringify({ success: true, order: { id: order.id, status: 'paid' } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('Payment capture failed');
    }

    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    // Update order status
    await supabase
      .from('shop_orders')
      .update({
        status: 'paid',
        paypal_capture_id: captureId,
      })
      .eq('id', order.id);

    // Decrement stock
    if (order.product_id) {
      const { data: product } = await supabase
        .from('shop_products')
        .select('stock_quantity')
        .eq('id', order.product_id)
        .single();

      if (product && product.stock_quantity !== null) {
        await supabase
          .from('shop_products')
          .update({ stock_quantity: Math.max(0, product.stock_quantity - order.quantity) })
          .eq('id', order.product_id);
      }
    }

    // Send confirmation email
    try {
      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          type: 'shop_order',
          email: order.customer_email,
          name: order.customer_name,
          orderId: order.id,
          productTitle: order.shop_products?.title || 'Product',
          amount: order.total_amount?.toString(),
          transactionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        },
      });
    } catch (emailErr) {
      console.error('Email send error:', emailErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          status: 'paid',
          total_amount: order.total_amount,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error capturing shop order:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
