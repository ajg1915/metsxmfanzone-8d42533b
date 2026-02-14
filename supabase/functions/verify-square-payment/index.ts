import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const planType = url.searchParams.get('planType');

    // If called as redirect from Square checkout
    if (req.method === 'GET' && userId && planType) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Find the pending subscription
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan_type, status, amount')
        .eq('user_id', userId)
        .eq('plan_type', planType)
        .eq('status', 'pending')
        .eq('payment_method', 'square')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !subscription) {
        console.error('Subscription not found:', fetchError);
        // Redirect to error page
        return new Response(null, {
          status: 302,
          headers: { 'Location': 'https://metsxmfanzone.lovable.app/payment-error' },
        });
      }

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date(startDate);
      if (planType === 'annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // Activate subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        })
        .eq('id', subscription.id);

      if (updateError) {
        console.error('Error activating subscription:', updateError);
        return new Response(null, {
          status: 302,
          headers: { 'Location': 'https://metsxmfanzone.lovable.app/payment-error' },
        });
      }

      // Get user profile for email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      // Send confirmation email
      try {
        const amount = planType === 'annual' ? '129.99' : '12.99';
        await supabase.functions.invoke('send-confirmation-email', {
          body: {
            type: 'subscription',
            email: profile?.email,
            name: profile?.full_name,
            planType,
            amount,
          },
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }

      // Notify admins
      try {
        await supabase.functions.invoke('notify-admin-new-member', {
          body: {
            userId,
            planType,
            amount: planType === 'annual' ? '$129.99' : '$12.99',
            source: 'Square',
          },
        });
      } catch (notifyError) {
        console.error('Error notifying admins:', notifyError);
      }

      console.log('Square payment verified, subscription activated');

      // Redirect to success page
      return new Response(null, {
        status: 302,
        headers: { 'Location': 'https://metsxmfanzone.lovable.app/paypal-success' },
      });
    }

    // POST-based verification (manual/frontend call)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error('Unauthorized');

    const { orderId } = await req.json();
    if (!orderId) throw new Error('Order ID is required');

    // Verify with Square Orders API
    const squareAccessToken = Deno.env.get('SQUARE_ACCESS_TOKEN');
    if (!squareAccessToken) throw new Error('Square not configured');

    const orderResponse = await fetch(`https://connect.squareup.com/v2/orders/${orderId}`, {
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${squareAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!orderResponse.ok) {
      throw new Error('Failed to verify Square order');
    }

    const orderData = await orderResponse.json();
    const order = orderData.order;

    if (order.state !== 'COMPLETED') {
      throw new Error('Order not completed');
    }

    return new Response(
      JSON.stringify({ success: true, status: order.state }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in verify-square-payment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
