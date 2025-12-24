import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

// AES-GCM encryption/decryption utilities
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

async function encryptFields(data: Record<string, any>, fields: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const field of fields) {
    if (data[field] !== undefined && data[field] !== null) {
      result[`encrypted_${field}`] = await encrypt(String(data[field]));
    }
  }
  return result;
}

async function decryptRecord(record: Record<string, any>, fields: string[]): Promise<Record<string, any>> {
  const result = { ...record };
  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = await decrypt(String(result[field]));
    }
  }
  return result;
}

serve(async (req) => {
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

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, dataType, data } = await req.json();

    // Define which fields to encrypt for each data type
    const encryptionSchema: Record<string, string[]> = {
      activity_logs: ['ip_address', 'user_agent'],
      profiles: ['email', 'phone_number', 'full_name'],
      business_ads: ['contact_email', 'contact_phone', 'business_name'],
      newsletter_subscribers: ['email', 'full_name'],
    };

    const fields = encryptionSchema[dataType];
    if (!fields) {
      return new Response(
        JSON.stringify({ error: 'Invalid data type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Audit logging helper - logs all admin data access to activity_logs
    const logAdminAccess = async (accessAction: string, recordCount: number, targetDataType: string) => {
      try {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action: accessAction,
          log_type: 'admin_data_access',
          resource_type: targetDataType,
          details: {
            action: accessAction,
            data_type: targetDataType,
            record_count: recordCount,
            timestamp: new Date().toISOString(),
            admin_email: user.email,
          },
        });
      } catch (logError) {
        console.error('Failed to log admin access:', logError);
      }
    };

    if (action === 'encrypt') {
      const encrypted = await encryptFields(data, fields);
      await logAdminAccess('encrypt', 1, dataType);
      console.log(`[AUDIT] Admin ${user.id} encrypted ${dataType} data`);
      
      return new Response(
        JSON.stringify({ encrypted }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'decrypt') {
      const { records } = data;
      
      if (!Array.isArray(records)) {
        return new Response(
          JSON.stringify({ error: 'Invalid records data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const decryptedRecords = await Promise.all(
        records.map((record: any) => decryptRecord(record, fields))
      );
      
      await logAdminAccess('decrypt', decryptedRecords.length, dataType);
      console.log(`[AUDIT] Admin ${user.id} decrypted ${decryptedRecords.length} ${dataType} records`);
      
      return new Response(
        JSON.stringify({ records: decryptedRecords }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'fetch-decrypted') {
      const { limit = 100, offset = 0, filters } = data || {};
      
      let query = supabase.from(dataType).select('*');
      
      // Apply filters if provided
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value);
        }
      }
      
      const { data: records, error: fetchError } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (fetchError) {
        console.error(`Error fetching ${dataType}:`, fetchError);
        return new Response(
          JSON.stringify({ error: `Failed to fetch ${dataType}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const decryptedRecords = await Promise.all(
        (records || []).map((record: any) => decryptRecord(record, fields))
      );
      
      await logAdminAccess('fetch-decrypted', decryptedRecords.length, dataType);
      console.log(`[AUDIT] Admin ${user.id} fetched and decrypted ${decryptedRecords.length} ${dataType} records`);
      
      return new Response(
        JSON.stringify({ records: decryptedRecords }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in secure-data-vault function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
