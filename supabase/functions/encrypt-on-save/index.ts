import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

// AES-GCM encryption utilities
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

async function encrypt(plaintext: string): Promise<string> {
  if (!plaintext) return '';
  
  const key = await getEncryptionKey();
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );
  
  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
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

// Encryption schemas for different tables
const encryptionSchemas: Record<string, string[]> = {
  profiles: ['email', 'phone_number'],
  business_ads: ['contact_email', 'contact_phone'],
  notification_subscriptions: ['endpoint', 'p256dh', 'auth'],
  newsletter_subscribers: ['email'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, table, data } = await req.json();

    const fieldsToEncrypt = encryptionSchemas[table];
    if (!fieldsToEncrypt) {
      return new Response(
        JSON.stringify({ error: 'Invalid table for encryption' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'encrypt') {
      // Encrypt specified fields
      const encryptedData = { ...data };
      for (const field of fieldsToEncrypt) {
        if (encryptedData[field]) {
          encryptedData[field] = await encrypt(encryptedData[field]);
        }
      }

      return new Response(
        JSON.stringify({ data: encryptedData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'decrypt') {
      // Decrypt specified fields - check if user is admin for sensitive tables
      const sensitiveTablesRequireAdmin = ['profiles', 'business_ads', 'newsletter_subscribers'];
      
      if (sensitiveTablesRequireAdmin.includes(table)) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (roleError || !roleData) {
          return new Response(
            JSON.stringify({ error: 'Admin access required for this table' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // For notification_subscriptions, user can decrypt their own
      if (table === 'notification_subscriptions' && data.user_id !== user.id) {
        // Check if admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (!roleData) {
          return new Response(
            JSON.stringify({ error: 'Can only decrypt own subscriptions' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      const decryptedData = { ...data };
      for (const field of fieldsToEncrypt) {
        if (decryptedData[field]) {
          decryptedData[field] = await decrypt(decryptedData[field]);
        }
      }

      return new Response(
        JSON.stringify({ data: decryptedData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in encrypt-on-save function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});