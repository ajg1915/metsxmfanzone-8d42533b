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
        
        // Trigger push notification
        await supabase.functions.invoke('send-push-notification', {
          body: {
            title: '🔥 Breaking Mets News!',
            body: news.title,
            icon: '/logo-192.png',
            url: '/#news'
          }
        });

        // Send SMS notification
        await sendSMSNotification(`🔥 Breaking Mets News: ${news.title}`);

        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔥 Breaking Mets News!', {
            body: news.title,
            icon: '/logo-192.png',
            badge: '/logo-192.png',
          });
        }
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
          await supabase.functions.invoke('send-push-notification', {
            body: {
              title: '🔴 LIVE NOW!',
              body: stream.title,
              icon: '/logo-192.png',
              url: '/live'
            }
          });

          // Send SMS notification
          await sendSMSNotification(`🔴 LIVE NOW: ${stream.title}`);

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🔴 LIVE NOW!', {
              body: stream.title,
              icon: '/logo-192.png',
              badge: '/logo-192.png',
            });
          }
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
        
        await supabase.functions.invoke('send-push-notification', {
          body: {
            title: '📰 New Blog Post',
            body: post.title,
            icon: '/logo-192.png',
            url: `/blog/${post.slug}`
          }
        });

        // Send SMS notification
        await sendSMSNotification(`📰 New Blog Post: ${post.title}`);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('📰 New Blog Post', {
            body: post.title,
            icon: '/logo-192.png',
            badge: '/logo-192.png',
          });
        }
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(newsChannel);
    supabase.removeChannel(liveStreamChannel);
    supabase.removeChannel(blogChannel);
  };
};
