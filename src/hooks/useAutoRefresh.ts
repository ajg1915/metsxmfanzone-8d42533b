import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const STREAMING_PATHS = [
  '/espn-network',
  '/pix11-network',
  '/mlb-network',
  '/metsxmfanzone-tv',
  '/spring-training-live',
  '/tv/',
];

/**
 * Real-time auto-refresh hook.
 * Subscribes to key Supabase tables via Realtime and triggers a hard refresh
 * ONLY when actual data changes occur — no more blind tab-switch reloads.
 */
export const useAutoRefresh = () => {
  const lastRefresh = useRef(Date.now());
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  const isStreamingPage = () => {
    return STREAMING_PATHS.some(path => location.pathname.startsWith(path));
  };

  useEffect(() => {
    // Minimum 10 seconds between refreshes to prevent rapid reloads
    const MIN_REFRESH_INTERVAL = 10_000;

    const triggerRefresh = () => {
      if (isStreamingPage()) {
        console.log('[AutoRefresh] Skipping refresh — user is on a streaming page');
        return;
      }

      const now = Date.now();
      if (now - lastRefresh.current < MIN_REFRESH_INTERVAL) {
        return; // Too soon since last refresh
      }

      // Debounce: wait 2 seconds for batch changes before reloading
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        console.log('[AutoRefresh] New data detected — refreshing');
        lastRefresh.current = Date.now();
        window.location.reload();
      }, 2000);
    };

    // Subscribe to tables that matter for the public-facing site
    const channel = supabase
      .channel('auto-refresh-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_slides' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_notifications' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stream_alerts' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_alerts' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'podcast_shows' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mets_news_tracker' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'podcast_live_stream' }, triggerRefresh)
      .subscribe((status) => {
        console.log('[AutoRefresh] Realtime status:', status);
      });

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      supabase.removeChannel(channel);
    };
  }, []);
};
