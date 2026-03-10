import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('presence_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('presence_session_id', sessionId);
  }
  return sessionId;
};

const getPageType = (path: string): string => {
  if (path.startsWith('/blog/') || path === '/blog') return 'blog';
  if (path.includes('live') || path.includes('stream') || path.includes('network') || path === '/metsxmfanzone') return 'stream';
  if (path === '/community') return 'community';
  if (path.startsWith('/admin')) return 'admin';
  return 'general';
};

const getReferrerSource = (): string => {
  const referrer = document.referrer.toLowerCase();
  const storedSource = sessionStorage.getItem('referrer_source');
  if (storedSource) return storedSource;
  
  let source = 'direct';
  if (!referrer) {
    source = 'direct';
  } else if (referrer.includes('google.') || referrer.includes('bing.') || referrer.includes('yahoo.') || referrer.includes('duckduckgo.') || referrer.includes('baidu.')) {
    source = 'search';
  } else if (referrer.includes('facebook.') || referrer.includes('twitter.') || referrer.includes('x.com') || referrer.includes('instagram.') || referrer.includes('tiktok.') || referrer.includes('linkedin.') || referrer.includes('reddit.') || referrer.includes('youtube.')) {
    source = 'social';
  } else if (!referrer.includes(window.location.hostname)) {
    source = 'referral';
  }
  sessionStorage.setItem('referrer_source', source);
  return source;
};

export const usePresenceTracking = () => {
  const location = useLocation();
  const sessionId = useRef(getSessionId());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userRef = useRef<string | null>(null);
  const checkedAuth = useRef(false);

  // Check auth once on mount, not every 60s
  useEffect(() => {
    if (checkedAuth.current) return;
    checkedAuth.current = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      userRef.current = user?.id || null;
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // Skip presence for anonymous users — they fail RLS anyway
    // We'll do one deferred check
    const timer = setTimeout(() => {
      if (!userRef.current) return; // anonymous — skip entirely

      const updatePresence = async () => {
        try {
          await supabase.from('realtime_presence').upsert({
            session_id: sessionId.current,
            current_page: location.pathname,
            page_type: getPageType(location.pathname),
            user_id: userRef.current,
            is_authenticated: true,
            user_agent: navigator.userAgent,
            last_seen_at: new Date().toISOString(),
            referrer_source: getReferrerSource(),
          }, { onConflict: 'session_id' });
        } catch {
          // Silently fail
        }
      };

      updatePresence();
      // Reduced to 120s to minimize Cloud load
      intervalRef.current = setInterval(updatePresence, 120000);
    }, 3000); // Defer 3s so it doesn't block initial render

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (!userRef.current) return;
      try {
        await supabase.from('realtime_presence').delete().eq('session_id', sessionId.current);
      } catch {}
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
      } catch {
        // silent
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
      } catch {
        // silent
      }
    };
    trackView();
  }, [streamId]);
};
