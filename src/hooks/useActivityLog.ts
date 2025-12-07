import { supabase } from "@/integrations/supabase/client";

type LogType = 'admin' | 'user' | 'system' | 'error';

interface LogOptions {
  logType: LogType;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}

export const logActivity = async (options: LogOptions) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('activity_logs' as any).insert([{
      user_id: user?.id,
      log_type: options.logType,
      action: options.action,
      resource_type: options.resourceType,
      resource_id: options.resourceId,
      details: options.details || {},
      user_agent: navigator.userAgent,
    }]);

    if (error) {
      console.error('Failed to log activity:', error);
    }
  } catch (err) {
    console.error('Activity logging error:', err);
  }
};

// Convenience functions
export const logAdminAction = (action: string, resourceType?: string, resourceId?: string, details?: Record<string, unknown>) =>
  logActivity({ logType: 'admin', action, resourceType, resourceId, details });

export const logUserAction = (action: string, resourceType?: string, resourceId?: string, details?: Record<string, unknown>) =>
  logActivity({ logType: 'user', action, resourceType, resourceId, details });

export const logSystemEvent = (action: string, details?: Record<string, unknown>) =>
  logActivity({ logType: 'system', action, details });

export const logError = (action: string, details?: Record<string, unknown>) =>
  logActivity({ logType: 'error', action, details });
