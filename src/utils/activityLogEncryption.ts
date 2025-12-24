import { supabase } from "@/integrations/supabase/client";

/**
 * Encrypts sensitive activity log data before storing
 * This ensures IP addresses and user agents are encrypted at rest
 */
export async function encryptActivityLogData(ipAddress: string, userAgent: string): Promise<{
  encrypted_ip_address: string;
  encrypted_user_agent: string;
} | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.warn('No session for encryption - storing as-is');
      return null;
    }

    const { data, error } = await supabase.functions.invoke('activity-logs-decrypt', {
      body: {
        action: 'encrypt',
        data: {
          ip_address: ipAddress,
          user_agent: userAgent
        }
      }
    });

    if (error) {
      console.error('Encryption failed:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error encrypting activity log data:', error);
    return null;
  }
}

/**
 * Fetches and decrypts activity logs for admin viewing
 * Only admins can decrypt the sensitive data
 */
export async function fetchDecryptedActivityLogs(limit = 100, offset = 0): Promise<any[]> {
  try {
    const { data, error } = await supabase.functions.invoke('activity-logs-decrypt', {
      body: {
        action: 'fetch-decrypted',
        data: { limit, offset }
      }
    });

    if (error) {
      console.error('Failed to fetch decrypted logs:', error);
      throw error;
    }

    return data?.logs || [];
  } catch (error) {
    console.error('Error fetching decrypted activity logs:', error);
    throw error;
  }
}

/**
 * Decrypts already-fetched activity logs
 * Useful when logs are already in memory
 */
export async function decryptActivityLogs(logs: any[]): Promise<any[]> {
  try {
    const { data, error } = await supabase.functions.invoke('activity-logs-decrypt', {
      body: {
        action: 'decrypt',
        data: { logs }
      }
    });

    if (error) {
      console.error('Failed to decrypt logs:', error);
      throw error;
    }

    return data?.logs || [];
  } catch (error) {
    console.error('Error decrypting activity logs:', error);
    throw error;
  }
}
