import { supabase } from "@/integrations/supabase/client";

// Helper to send SMS notifications
const sendSMSNotification = async (message: string) => {
  try {
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
          await sendPushNotification(title, stream.title, '/live', 'live-stream');
          await sendSMSNotification(`🔴 LIVE NOW: ${stream.title}`);
          showBrowserNotification(title, stream.title);
        }
      }
    )
    .subscribe();

  // Listen for live stream status changes (going live)
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
          await sendPushNotification(title, newStream.title, '/live', 'live-stream');
          await sendSMSNotification(`🔴 LIVE NOW: ${newStream.title}`);
          showBrowserNotification(title, newStream.title);
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
          showBrowserNotification(title, newNotif.message);
        }
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(newsChannel);
    supabase.removeChannel(liveStreamChannel);
    supabase.removeChannel(liveStreamUpdateChannel);
    supabase.removeChannel(blogChannel);
    supabase.removeChannel(eventsChannel);
    supabase.removeChannel(storiesChannel);
    supabase.removeChannel(videosChannel);
    supabase.removeChannel(podcastsChannel);
    supabase.removeChannel(podcastLiveChannel);
    supabase.removeChannel(liveNotificationChannel);
  };
};