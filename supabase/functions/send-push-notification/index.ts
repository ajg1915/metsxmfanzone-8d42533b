import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

// VAPID public key
const VAPID_PUBLIC_KEY = Deno.env.get('VITE_VAPID_PUBLIC_KEY') || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const VAPID_SUBJECT = 'mailto:metsxmfanzone@gmail.com';

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
    if (!ciphertext.match(/^[A-Za-z0-9+/]+=*$/)) {
      return ciphertext;
    }
    
    const key = await getEncryptionKey();
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    
    if (combined.length < 13) {
      return ciphertext;
    }
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch {
    return ciphertext;
  }
}

// Base64 URL encoding/decoding helpers
function base64UrlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(data);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Create VAPID JWT token
async function createVapidJwt(audience: string): Promise<string> {
  if (!VAPID_PRIVATE_KEY) {
    throw new Error('VAPID_PRIVATE_KEY not configured');
  }

  const header = { alg: 'ES256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: VAPID_SUBJECT,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Convert base64url private key to raw bytes
  const privateKeyBytes = base64UrlDecode(VAPID_PRIVATE_KEY);
  
  // Create JWK for EC private key (P-256)
  // The private key d value is the base64url encoded private key
  const jwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    d: VAPID_PRIVATE_KEY,
    // We need x and y coordinates - derive from public key
    x: base64UrlEncode(base64UrlDecode(VAPID_PUBLIC_KEY).slice(1, 33)),
    y: base64UrlEncode(base64UrlDecode(VAPID_PUBLIC_KEY).slice(33, 65)),
  };

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    encoder.encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format (64 bytes)
  const signature = new Uint8Array(signatureBuffer);
  let rawSignature: Uint8Array;
  
  if (signature.length === 64) {
    rawSignature = signature;
  } else {
    // DER format - extract r and s values
    rawSignature = new Uint8Array(64);
    let offset = 3;
    let rLen = signature[offset];
    offset++;
    if (rLen === 33) {
      rawSignature.set(signature.slice(offset + 1, offset + 33), 0);
      offset += 33;
    } else {
      rawSignature.set(signature.slice(offset + (32 - rLen), offset + rLen), 32 - rLen);
      offset += rLen;
    }
    offset++; // skip 0x02
    let sLen = signature[offset];
    offset++;
    if (sLen === 33) {
      rawSignature.set(signature.slice(offset + 1, offset + 33), 32);
    } else {
      rawSignature.set(signature.slice(offset, offset + sLen), 32 + (32 - sLen));
    }
  }

  const signatureB64 = base64UrlEncode(rawSignature);
  return `${unsignedToken}.${signatureB64}`;
}

// Send push notification using Web Push protocol
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; icon?: string; url?: string; tag?: string }
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;

    console.log(`Pushing to: ${subscription.endpoint.substring(0, 60)}...`);

    const headers: Record<string, string> = {
      'TTL': '86400',
      'Urgency': 'high',
    };

    // Add VAPID authorization if configured
    if (VAPID_PRIVATE_KEY) {
      try {
        const vapidJwt = await createVapidJwt(audience);
        headers['Authorization'] = `vapid t=${vapidJwt}, k=${VAPID_PUBLIC_KEY}`;
        console.log('VAPID authorization added');
      } catch (vapidError) {
        console.error('VAPID JWT error:', vapidError);
      }
    }

    // Send notification without encrypted payload (minimal push to trigger SW)
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': '0',
      },
    });

    const statusCode = response.status;
    
    if (statusCode === 201 || statusCode === 200) {
      console.log('Push sent successfully');
      return { success: true, statusCode };
    } else if (statusCode === 410 || statusCode === 404) {
      console.log('Subscription expired');
      return { success: false, statusCode, error: 'Subscription expired' };
    } else {
      const errorText = await response.text();
      console.error(`Push failed: ${statusCode} - ${errorText}`);
      return { success: false, statusCode, error: errorText };
    }
  } catch (error) {
    console.error('Push error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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

    const isSystemCall = req.headers.get('X-System-Call') === 'true';
    
    if (!isSystemCall) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Admin verified:', user.id);
    }

    const { title, body, icon, url, tag, targetUsers } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let query = supabase.from('notification_subscriptions').select('*');
    
    if (targetUsers && Array.isArray(targetUsers) && targetUsers.length > 0) {
      query = query.in('user_id', targetUsers);
    }
    
    const { data: subscriptions, error } = await query;

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active subscriptions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending to ${subscriptions.length} subscribers, VAPID: ${VAPID_PRIVATE_KEY ? 'yes' : 'no'}`);

    const payload = {
      title,
      body,
      icon: icon || '/logo-192.png',
      url: url || '/',
      tag: tag || 'metsxm-notification',
    };

    const results = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          const decryptedEndpoint = await decrypt(subscription.endpoint);
          const decryptedP256dh = await decrypt(subscription.p256dh);
          const decryptedAuth = await decrypt(subscription.auth);

          const result = await sendPushNotification(
            { endpoint: decryptedEndpoint, p256dh: decryptedP256dh, auth: decryptedAuth },
            payload
          );

          if (result.statusCode === 410 || result.statusCode === 404) {
            await supabase.from('notification_subscriptions').delete().eq('id', subscription.id);
          }

          return { ...result, userId: subscription.user_id };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;

    return new Response(
      JSON.stringify({ 
        message: `Sent ${successCount} notifications`,
        total: subscriptions.length,
        successful: successCount,
        failed: subscriptions.length - successCount,
        vapidConfigured: !!VAPID_PRIVATE_KEY,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
