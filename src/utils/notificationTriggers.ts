import { supabase } from "@/integrations/supabase/client";

// Helper to check if user is admin before sending admin-only notifications
const isCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return false;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    return !!data;
  } catch {
    return false;
  }
};

// Helper to send SMS notifications (admin only - silently skips if not admin)
const sendSMSNotification = async (message: string) => {
  try {
    // Only admins can trigger SMS notifications
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      console.log('SMS notification skipped - user is not admin');
      return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.log('SMS notification skipped - no valid session');
      return;
    }

    await supabase.functions.invoke('send-sms-notification', {
      body: {
        message,
        sendToAll: true
      }
    });
  } catch (error) {
    console.error('Failed to send SMS notification:', error);
  }
};

// Helper to send push notifications
const sendPushNotification = async (
  title: string, 
  body: string, 
  url: string = '/',
  tag?: string
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    await supabase.functions.invoke('send-push-notification', {
      body: {
        title,
        body,
        icon: '/logo-192.png',
        url,
        tag: tag || 'metsxm-notification'
      },
      headers: session?.access_token ? {
        'X-System-Call': 'true'
      } : undefined
    });
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
};

// Helper to send email notifications
const sendEmailNotification = async (
  title: string,
  message: string,
  notificationType: 'game_alert' | 'score_update' | 'lineup' | 'news' | 'live_stream' | 'event' | 'general',
  url?: string,
  gameInfo?: {
    opponent?: string;
    date?: string;
    time?: string;
    location?: string;
  }
) => {
  try {
    await supabase.functions.invoke('send-game-notification-email', {
      body: {
        title,
        message,
        notificationType,
        url,
        gameInfo
      }
    });
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
};

// Show browser notification if permission granted
const showBrowserNotification = (title: string, body: string, icon: string = '/logo-192.png') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon,
      badge: '/logo-192.png',
    });
  }
};

export const setupNotificationListeners = () => {
  // Listen for new Mets Live Tracker items
  const newsChannel = supabase
    .channel('news-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mets_news_tracker',
        filter: 'published=eq.true'
      },
      async (payload) => {
        const news = payload.new as any;
        const title = '🔥 Breaking Mets News!';
        
        await sendPushNotification(title, news.title, '/#news', 'mets-news');
        await sendSMSNotification(`🔥 Breaking Mets News: ${news.title}`);
        await sendEmailNotification(title, news.details || news.title, 'news', '/#news');
        showBrowserNotification(title, news.title);
      }
    )
    .subscribe();

  // Listen for new live streams
  const liveStreamChannel = supabase
    .channel('livestream-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'live_streams',
        filter: 'published=eq.true'
      },
      async (payload) => {
        const stream = payload.new as any;
        
        if (stream.status === 'live') {
          const title = '🔴 LIVE NOW!';
          await sendPushNotification(title, stream.title, '/metsxmfanzone-tv', 'live-stream');
          await sendSMSNotification(`🔴 LIVE NOW: ${stream.title}`);
          await sendEmailNotification(title, stream.description || stream.title, 'live_stream', '/metsxmfanzone-tv');
          showBrowserNotification(title, stream.title);
        }
      }
    )
    .subscribe();

  // Listen for live stream status changes (going live, offline, ended)
  const liveStreamUpdateChannel = supabase
    .channel('livestream-update-notifications')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'live_streams'
      },
      async (payload) => {
        const oldStream = payload.old as any;
        const newStream = payload.new as any;
        
        // Check if stream just went live
        if (oldStream.status !== 'live' && newStream.status === 'live' && newStream.published) {
          const title = '🔴 LIVE NOW!';
          await sendPushNotification(title, newStream.title, '/metsxmfanzone-tv', 'live-stream');
          await sendSMSNotification(`🔴 LIVE NOW: ${newStream.title}`);
          await sendEmailNotification(title, newStream.description || newStream.title, 'live_stream', '/metsxmfanzone-tv');
          showBrowserNotification(title, newStream.title);
        }
        
        // Check if stream just ended or went offline
        if (oldStream.status === 'live' && (newStream.status === 'ended' || newStream.status === 'offline')) {
          const title = '📴 Stream Ended';
          const message = `${newStream.title} has ended. Thanks for watching!`;
          await sendPushNotification(title, message, '/', 'stream-ended');
          showBrowserNotification(title, message);
        }
      }
    )
    .subscribe();

  // Listen for stream health issues
  const streamHealthChannel = supabase
    .channel('stream-health-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'stream_health_reports'
      },
      async (payload) => {
        const report = payload.new as any;
        
        // Only notify for high severity issues
        if (report.severity === 'high' || report.severity === 'critical') {
          const title = '⚠️ Stream Issue Detected';
          const message = report.description || 'We are experiencing technical difficulties. Please standby.';
          await sendPushNotification(title, message, '/metsxmfanzone-tv', 'stream-issue');
          showBrowserNotification(title, message);
        }
      }
    )
    .subscribe();

  // Listen for stream alerts (admin-triggered alerts)
  const streamAlertChannel = supabase
    .channel('stream-alert-notifications')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'stream_alerts'
      },
      async (payload) => {
        const oldAlert = payload.old as any;
        const newAlert = payload.new as any;
        
        // Check if alert just became active
        if (!oldAlert.is_active && newAlert.is_active) {
          const title = '⚠️ Stream Alert';
          await sendPushNotification(title, newAlert.message, '/metsxmfanzone-tv', 'stream-alert');
          showBrowserNotification(title, newAlert.message);
        }
      }
    )
    .subscribe();

  // Listen for new blog posts
  const blogChannel = supabase
    .channel('blog-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'blog_posts',
        filter: 'published=eq.true'
      },
      async (payload) => {
        const post = payload.new as any;
        const title = '📰 New Blog Post';
        
        await sendPushNotification(title, post.title, `/blog/${post.slug}`, 'blog-post');
        await sendSMSNotification(`📰 New Blog Post: ${post.title}`);
        await sendEmailNotification(title, post.excerpt || post.title, 'news', `/blog/${post.slug}`);
        showBrowserNotification(title, post.title);
      }
    )
    .subscribe();

  // Listen for new events
  const eventsChannel = supabase
    .channel('events-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'events',
        filter: 'published=eq.true'
      },
      async (payload) => {
        const event = payload.new as any;
        const title = '📅 New Event Added!';
        
        await sendPushNotification(title, event.title, '/events', 'event');
        await sendSMSNotification(`📅 New Event: ${event.title}`);
        await sendEmailNotification(
          title, 
          event.description || event.title, 
          'event', 
          '/events',
          {
            date: event.event_date,
            location: event.location
          }
        );
        showBrowserNotification(title, event.title);
      }
    )
    .subscribe();

  // Listen for new stories
  const storiesChannel = supabase
    .channel('stories-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'stories',
        filter: 'published=eq.true'
      },
      async (payload) => {
        const story = payload.new as any;
        const title = '📱 New Story!';
        
        await sendPushNotification(title, story.title, '/', 'story');
        showBrowserNotification(title, story.title);
      }
    )
    .subscribe();

  // Listen for new videos
  const videosChannel = supabase
    .channel('videos-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'videos',
        filter: 'published=eq.true'
      },
      async (payload) => {
        const video = payload.new as any;
        const title = '🎬 New Video!';
        
        await sendPushNotification(title, video.title, '/video-gallery', 'video');
        await sendSMSNotification(`🎬 New Video: ${video.title}`);
        await sendEmailNotification(title, video.description || video.title, 'general', '/video-gallery');
        showBrowserNotification(title, video.title);
      }
    )
    .subscribe();

  // Listen for new podcasts
  const podcastsChannel = supabase
    .channel('podcasts-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'podcasts',
        filter: 'published=eq.true'
      },
      async (payload) => {
        const podcast = payload.new as any;
        const title = '🎙️ New Podcast Episode!';
        
        await sendPushNotification(title, podcast.title, '/podcast', 'podcast');
        await sendSMSNotification(`🎙️ New Podcast: ${podcast.title}`);
        await sendEmailNotification(title, podcast.description || podcast.title, 'general', '/podcast');
        showBrowserNotification(title, podcast.title);
      }
    )
    .subscribe();

  // Listen for podcast going live
  const podcastLiveChannel = supabase
    .channel('podcast-live-notifications')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'podcast_live_stream'
      },
      async (payload) => {
        const oldPodcast = payload.old as any;
        const newPodcast = payload.new as any;
        
        // Check if podcast just went live
        if (!oldPodcast.is_live && newPodcast.is_live) {
          const title = '🎙️ Podcast LIVE NOW!';
          await sendPushNotification(title, newPodcast.title, '/community-podcast', 'podcast-live');
          await sendSMSNotification(`🎙️ Podcast LIVE: ${newPodcast.title}`);
          await sendEmailNotification(title, newPodcast.description || newPodcast.title, 'live_stream', '/community-podcast');
          showBrowserNotification(title, newPodcast.title);
        }
      }
    )
    .subscribe();

  // Listen for live notification bar updates
  const liveNotificationChannel = supabase
    .channel('live-notification-bar')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'live_notifications'
      },
      async (payload) => {
        const oldNotif = payload.old as any;
        const newNotif = payload.new as any;
        
        // Check if notification just became active
        if (!oldNotif.is_active && newNotif.is_active) {
          const title = '📢 Important Update!';
          await sendPushNotification(title, newNotif.message, newNotif.link_url || '/', 'announcement');
          await sendEmailNotification(title, newNotif.message, 'general', newNotif.link_url || '/');
          showBrowserNotification(title, newNotif.message);
        }
      }
    )
    .subscribe();

  // Listen for new lineup cards (game alerts)
  const lineupChannel = supabase
    .channel('lineup-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'lineup_cards',
        filter: 'published=eq.true'
      },
      async (payload) => {
        const lineup = payload.new as any;
        const title = '📋 Game Lineup Posted!';
        const message = `Lineup for ${lineup.opponent} on ${lineup.game_date} is now available!`;
        
        await sendPushNotification(title, message, '/mets-lineup-card', 'lineup');
        await sendSMSNotification(`📋 ${message}`);
        await sendEmailNotification(
          title, 
          message, 
          'lineup', 
          '/mets-lineup-card',
          {
            opponent: lineup.opponent,
            date: lineup.game_date,
            time: lineup.game_time,
            location: lineup.location
          }
        );
        showBrowserNotification(title, message);
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(newsChannel);
    supabase.removeChannel(liveStreamChannel);
    supabase.removeChannel(liveStreamUpdateChannel);
    supabase.removeChannel(streamHealthChannel);
    supabase.removeChannel(streamAlertChannel);
    supabase.removeChannel(blogChannel);
    supabase.removeChannel(eventsChannel);
    supabase.removeChannel(storiesChannel);
    supabase.removeChannel(videosChannel);
    supabase.removeChannel(podcastsChannel);
    supabase.removeChannel(podcastLiveChannel);
    supabase.removeChannel(liveNotificationChannel);
    supabase.removeChannel(lineupChannel);
  };
};