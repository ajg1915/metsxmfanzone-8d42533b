import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the VAPID public key from environment
    const vapidPublicKey = Deno.env.get('VITE_VAPID_PUBLIC_KEY');

    if (!vapidPublicKey) {
      console.error('VITE_VAPID_PUBLIC_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'VAPID key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Returning VAPID public key');

    return new Response(
      JSON.stringify({ vapidPublicKey }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error getting VAPID key:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get VAPID key' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
