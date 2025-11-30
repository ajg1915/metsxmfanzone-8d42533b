import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header received:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No bearer token in authorization header');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    console.log('getUser result:', { user: user?.id, error: userError?.message });
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`);
    }

    const { checkoutToken } = await req.json();
    
    if (!checkoutToken) {
      throw new Error('Checkout token is required');
    }

    console.log('Processing Helcim checkout token:', checkoutToken);

    // Get subscription from database
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('paypal_order_id', checkoutToken) // Using paypal_order_id field for Helcim checkout token
      .single();

    if (fetchError || !subscription) {
      throw new Error('Subscription not found');
    }

    // Verify user owns this subscription
    if (subscription.user_id !== user.id) {
      throw new Error('Unauthorized access to subscription');
    }

    // Calculate end date based on plan type
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    if (subscription.plan_type === 'premium') {
      endDate.setMonth(endDate.getMonth() + 1); // 1 month
    } else if (subscription.plan_type === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year
    }

    // Update subscription status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      throw updateError;
    }

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    // Send confirmation email
    try {
      const amount = subscription.plan_type === 'annual' ? '99.99' : '9.99';
      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          type: 'subscription',
          email: profile?.email || user.email,
          name: profile?.full_name,
          planType: subscription.plan_type,
          amount: amount,
        },
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the payment if email fails
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in verify-helcim-payment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
