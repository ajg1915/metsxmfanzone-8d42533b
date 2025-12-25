import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

// VAPID keys for web push
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

// AES-GCM decryption for encrypted push subscription data
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyString = Deno.env.get('ACTIVITY_LOGS_ENCRYPTION_KEY') ?? '';
  if (!keyString) {
    throw new Error('Encryption key not configured');
  }
  
  const encoder = new TextEncoder();
  const keyData = await crypto.subtle.digest('SHA-256', encoder.encode(keyString));
  
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

async function decrypt(ciphertext: string): Promise<string> {
  if (!ciphertext) return '';
  
  try {
    // Check if already decrypted (not base64 encrypted format)
    if (!ciphertext.match(/^[A-Za-z0-9+/]+=*$/)) {
      return ciphertext;
    }
    
    const key = await getEncryptionKey();
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    
    if (combined.length < 13) {
      return ciphertext; // Too short to be encrypted
    }
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    // Return original if decryption fails (might not be encrypted)
    return ciphertext;
  }
}

// Helper function to create the JWT for VAPID
async function createVapidJwt(audience: string, subject: string, privateKeyBase64: string): Promise<string> {
  const header = { alg: 'ES256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: subject,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import the private key
  const privateKeyBytes = Uint8Array.from(atob(privateKeyBase64), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${unsignedToken}.${signatureB64}`;
}

// Send push notification to a single subscription
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; icon?: string; url?: string; tag?: string }
): Promise<boolean> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    
    // For now, we'll use a simplified approach that works without VAPID private key
    // In production, you'd set up proper VAPID keys
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/logo-192.png',
      badge: '/logo-192.png',
      url: payload.url || '/',
      tag: payload.tag || 'metsxm-notification',
      timestamp: Date.now(),
    });

    console.log(`Sending notification to endpoint: ${subscription.endpoint.substring(0, 50)}...`);
    
    // Create the push message body
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': '0',
        'TTL': '86400', // 24 hours
        'Urgency': 'high',
      },
    });

    if (!response.ok) {
      console.error(`Push failed with status ${response.status}: ${await response.text()}`);
      return false;
    }

    console.log('Push notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this is an internal system call (for automatic notifications)
    const isSystemCall = req.headers.get('X-System-Call') === 'true';
    
    if (!isSystemCall) {
      // Verify the caller is authenticated and is an admin for manual calls
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        console.error('No authorization header provided');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - No authorization header' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error('Authentication failed:', authError);
        return new Response(
          JSON.stringify({ error: 'Unauthorized - Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleData) {
        console.error('Admin access required. User:', user.id);
        return new Response(
          JSON.stringify({ error: 'Forbidden - Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Admin verified:', user.id);
    } else {
      console.log('System call - bypassing admin check');
    }

    const { title, body, icon, url, tag, targetUsers } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get notification subscriptions
    let query = supabase.from('notification_subscriptions').select('*');
    
    // If targeting specific users, filter by user_id
    if (targetUsers && Array.isArray(targetUsers) && targetUsers.length > 0) {
      query = query.in('user_id', targetUsers);
    }
    
    const { data: subscriptions, error } = await query;

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

    const payload = {
      title,
      body,
      icon: icon || '/logo-192.png',
      url: url || '/',
      tag: tag || 'metsxm-notification',
    };

    // Send push notifications to all subscribers - decrypt endpoints first
    const notificationPromises = subscriptions.map(async (subscription) => {
      try {
        // Decrypt the push subscription data
        const decryptedEndpoint = await decrypt(subscription.endpoint);
        const decryptedP256dh = await decrypt(subscription.p256dh);
        const decryptedAuth = await decrypt(subscription.auth);

        const success = await sendPushNotification(
          {
            endpoint: decryptedEndpoint,
            p256dh: decryptedP256dh,
            auth: decryptedAuth,
          },
          payload
        );

        return { success, endpoint: decryptedEndpoint.substring(0, 50), userId: subscription.user_id };
      } catch (error) {
        console.error('Error sending notification:', error);
        
        // If subscription is invalid (410 Gone), remove it
        if (error instanceof Error && error.message.includes('410')) {
          await supabase
            .from('notification_subscriptions')
            .delete()
            .eq('id', subscription.id);
          console.log('Removed invalid subscription:', subscription.id);
        }
        
        return { 
          success: false, 
          endpoint: subscription.endpoint, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    const results = await Promise.all(notificationPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`Notifications sent: ${successCount}/${subscriptions.length}`);

    return new Response(
      JSON.stringify({ 
        message: `Sent ${successCount} notifications`,
        total: subscriptions.length,
        successful: successCount,
        failed: subscriptions.length - successCount,
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