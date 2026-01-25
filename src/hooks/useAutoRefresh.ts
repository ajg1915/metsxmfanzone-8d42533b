import { useEffect } from 'react';

export const useAutoRefresh = () => {
  useEffect(() => {
    // Disabled auto-refresh on service worker updates
    // Content updates via Supabase realtime subscriptions instead
    // Users can manually refresh if needed - no more constant page reloads
    
    // The service worker still caches assets for offline/performance,
    // but won't force page reloads when updated
  }, []);
};
