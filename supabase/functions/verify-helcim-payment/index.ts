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
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { checkoutId } = await req.json();
    
    if (!checkoutId) {
      throw new Error('Checkout ID is required');
    }

    // Verify payment with Helcim
    const helcimApiToken = Deno.env.get('HELCIM_API_TOKEN');
    
    if (!helcimApiToken) {
      throw new Error('Helcim credentials not configured');
    }

    const helcimResponse = await fetch(`https://api.helcim.com/v2/payment/checkout/${checkoutId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-token': helcimApiToken,
      },
    });

    if (!helcimResponse.ok) {
      const errorData = await helcimResponse.text();
      console.error('Helcim verification error:', errorData);
      throw new Error(`Failed to verify payment: ${helcimResponse.status}`);
    }

    const paymentData = await helcimResponse.json();
    
    // Check if payment was successful
    if (paymentData.status !== 'APPROVED') {
      throw new Error('Payment was not approved');
    }

    // Get subscription from database
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('paypal_order_id', checkoutId) // Using paypal_order_id field for Helcim checkout ID
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
