import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { title, body, icon, url } = await req.json();

    // Get all active notification subscriptions
    const { data: subscriptions, error } = await supabase
      .from('notification_subscriptions')
      .select('*');

    if (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active subscriptions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending notifications to ${subscriptions.length} subscribers`);

    // Send push notifications to all subscribers
    const notificationPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        // For production, you'd use web-push library to send actual push notifications
        // This is a placeholder for the notification sending logic
        console.log('Would send notification to:', pushSubscription.endpoint.substring(0, 50));
        
        // In production, you would do something like:
        // await webpush.sendNotification(pushSubscription, JSON.stringify({
        //   title,
        //   body,
        //   icon: icon || '/logo-192.png',
        //   data: { url }
        // }));

        return { success: true, endpoint: subscription.endpoint };
      } catch (error) {
        console.error('Error sending notification:', error);
        
        // If subscription is invalid, remove it
        if (error instanceof Error && 'statusCode' in error && (error as any).statusCode === 410) {
          await supabase
            .from('notification_subscriptions')
            .delete()
            .eq('id', subscription.id);
        }
        
        return { success: false, endpoint: subscription.endpoint, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const results = await Promise.all(notificationPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`Notifications sent: ${successCount}/${subscriptions.length}`);

    return new Response(
      JSON.stringify({ 
        message: `Sent ${successCount} notifications`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
