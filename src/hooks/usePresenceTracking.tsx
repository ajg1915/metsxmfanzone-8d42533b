import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Generate a unique session ID for anonymous tracking
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('presence_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('presence_session_id', sessionId);
  }
  return sessionId;
};

// Determine page type based on path
const getPageType = (path: string): string => {
  if (path.startsWith('/blog/') || path === '/blog') return 'blog';
  if (path.includes('live') || path.includes('stream') || path.includes('network') || path === '/metsxmfanzone-tv') return 'stream';
  if (path === '/community') return 'community';
  if (path.startsWith('/admin')) return 'admin';
  return 'general';
};

export const usePresenceTracking = () => {
  const location = useLocation();
  const sessionId = useRef(getSessionId());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updatePresence = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const pageType = getPageType(location.pathname);

        // Use upsert to handle both insert and update
        await supabase.from('realtime_presence').upsert({
          session_id: sessionId.current,
          current_page: location.pathname,
          page_type: pageType,
          user_id: user?.id || null,
          is_authenticated: !!user,
          user_agent: navigator.userAgent,
          last_seen_at: new Date().toISOString(),
        }, {
          onConflict: 'session_id'
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.debug('Presence tracking error:', error);
      }
    };

    // Update immediately on page change
    updatePresence();

    // Update every 30 seconds to keep presence alive
    intervalRef.current = setInterval(updatePresence, 30000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [location.pathname]);

  // Cleanup presence on window unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        await supabase.from('realtime_presence').delete().eq('session_id', sessionId.current);
      } catch (error) {
        // Ignore errors on unload
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
};

// Hook for tracking blog views
export const useBlogViewTracking = (blogPostId: string | undefined) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!blogPostId || hasTracked.current) return;

    const trackView = async () => {
      try {
        const sessionId = getSessionId();
        const { data: { user } } = await supabase.auth.getUser();

        await supabase.from('blog_views').insert({
          blog_post_id: blogPostId,
          user_id: user?.id || null,
          session_id: sessionId,
        });

        hasTracked.current = true;
      } catch (error) {
        console.debug('Blog view tracking error:', error);
      }
    };

    trackView();
  }, [blogPostId]);
};

// Hook for tracking stream views
export const useStreamViewTracking = (streamId: string | undefined) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!streamId || hasTracked.current) return;

    const trackView = async () => {
      try {
        const sessionId = getSessionId();
        const { data: { user } } = await supabase.auth.getUser();

        await supabase.from('stream_views').insert({
          stream_id: streamId,
          user_id: user?.id || null,
          session_id: sessionId,
        });

        hasTracked.current = true;
      } catch (error) {
        console.debug('Stream view tracking error:', error);
      }
    };

    trackView();
  }, [streamId]);
};
