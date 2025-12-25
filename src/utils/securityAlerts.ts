import { supabase } from "@/integrations/supabase/client";

type AlertType = 
  | "bulk_data_export" 
  | "failed_login_attempts" 
  | "suspicious_admin_activity"
  | "unusual_access_pattern"
  | "rate_limit_exceeded";

interface AlertDetails {
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  dataType?: string;
  recordCount?: number;
  attemptCount?: number;
  timeWindow?: string;
  action?: string;
  additionalInfo?: string;
}

/**
 * Triggers a security alert for suspicious activity
 * Sends email notifications to admins if thresholds are exceeded
 */
export async function triggerSecurityAlert(
  alertType: AlertType,
  details: AlertDetails
): Promise<{ success: boolean; alerted?: boolean }> {
  try {
    // Add browser context to details
    const enrichedDetails: AlertDetails = {
      ...details,
      userAgent: details.userAgent || navigator.userAgent,
    };

    const { data, error } = await supabase.functions.invoke('security-alerts', {
      body: {
        alertType,
        details: enrichedDetails,
      },
    });

    if (error) {
      console.error('Failed to trigger security alert:', error);
      return { success: false };
    }

    return { 
      success: true, 
      alerted: data?.alerted || false 
    };
  } catch (error) {
    console.error('Error triggering security alert:', error);
    return { success: false };
  }
}

/**
 * Track failed login attempt and trigger alert if threshold exceeded
 */
export async function trackFailedLogin(email: string, ipAddress?: string): Promise<void> {
  await triggerSecurityAlert('failed_login_attempts', {
    email,
    ipAddress,
    action: 'login_failed',
  });
}

/**
 * Track bulk data export and trigger alert if threshold exceeded
 */
export async function trackBulkExport(
  adminEmail: string,
  dataType: string,
  recordCount: number
): Promise<void> {
  await triggerSecurityAlert('bulk_data_export', {
    email: adminEmail,
    dataType,
    recordCount,
    action: 'data_export',
  });
}

/**
 * Track suspicious admin activity
 */
export async function trackSuspiciousActivity(
  adminEmail: string,
  action: string,
  additionalInfo?: string
): Promise<void> {
  await triggerSecurityAlert('suspicious_admin_activity', {
    email: adminEmail,
    action,
    additionalInfo,
  });
}
