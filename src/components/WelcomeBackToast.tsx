import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, parseISO, isAfter } from "date-fns";
import { Sparkles, Newspaper, Video, Radio, Calendar } from "lucide-react";

interface NewContent {
  blogPosts: { title: string; slug: string }[];
  podcasts: { title: string }[];
  liveStreams: { title: string }[];
  events: { title: string }[];
}

const LAST_VISIT_KEY = 'metsxm_last_visit';

export const WelcomeBackToast = () => {
  const { user } = useAuth();
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const checkAndShowWelcome = async () => {
      if (hasShown) return;

      const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
      const now = new Date();

      // Always update last visit time
      localStorage.setItem(LAST_VISIT_KEY, now.toISOString());

      // If no previous visit, this is their first time - don't show welcome back
      if (!lastVisit) return;

      const lastVisitDate = parseISO(lastVisit);
      
      // Only show if they've been away for at least 1 hour
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      if (isAfter(lastVisitDate, hourAgo)) return;

      setHasShown(true);

      try {
        // Fetch new content since last visit
        const newContent: NewContent = {
          blogPosts: [],
          podcasts: [],
          liveStreams: [],
          events: [],
        };

        // Fetch new blog posts
        const { data: blogPosts } = await supabase
          .from('blog_posts')
          .select('title, slug')
          .eq('published', true)
          .gt('created_at', lastVisit)
          .order('created_at', { ascending: false })
          .limit(3);

        if (blogPosts) newContent.blogPosts = blogPosts;

        // Fetch new podcasts
        const { data: podcasts } = await supabase
          .from('podcasts')
          .select('title')
          .eq('published', true)
          .gt('created_at', lastVisit)
          .order('created_at', { ascending: false })
          .limit(3);

        if (podcasts) newContent.podcasts = podcasts;

        // Fetch active or upcoming live streams
        const { data: liveStreams } = await supabase
          .from('live_streams')
          .select('title')
          .eq('published', true)
          .in('status', ['live', 'scheduled'])
          .order('created_at', { ascending: false })
          .limit(2);

        if (liveStreams) newContent.liveStreams = liveStreams;

        // Fetch upcoming events
        const { data: events } = await supabase
          .from('events')
          .select('title')
          .eq('published', true)
          .gte('event_date', now.toISOString())
          .order('event_date', { ascending: true })
          .limit(2);

        if (events) newContent.events = events;

        // Build toast message
        const totalNew = 
          newContent.blogPosts.length + 
          newContent.podcasts.length + 
          newContent.liveStreams.length +
          newContent.events.length;

        if (totalNew === 0) {
          // Just show a simple welcome back
          toast("Welcome back! 👋", {
            description: "Great to see you again. Enjoy browsing!",
            duration: 4000,
          });
          return;
        }

        // Show detailed update toast
        const updates: string[] = [];
        
        if (newContent.blogPosts.length > 0) {
          updates.push(`📰 ${newContent.blogPosts.length} new article${newContent.blogPosts.length > 1 ? 's' : ''}`);
        }
        if (newContent.podcasts.length > 0) {
          updates.push(`🎙️ ${newContent.podcasts.length} new podcast${newContent.podcasts.length > 1 ? 's' : ''}`);
        }
        if (newContent.liveStreams.length > 0) {
          const hasLive = newContent.liveStreams.some(s => s.title);
          updates.push(`📺 ${newContent.liveStreams.length} stream${newContent.liveStreams.length > 1 ? 's' : ''} ${hasLive ? 'live now!' : 'scheduled'}`);
        }
        if (newContent.events.length > 0) {
          updates.push(`📅 ${newContent.events.length} upcoming event${newContent.events.length > 1 ? 's' : ''}`);
        }

        toast("Welcome back! 🎉", {
          description: (
            <div className="space-y-1 mt-1">
              <p className="font-medium">Here's what's new:</p>
              {updates.map((update, i) => (
                <p key={i} className="text-sm">{update}</p>
              ))}
            </div>
          ),
          duration: 6000,
          action: {
            label: "View Updates",
            onClick: () => window.location.href = "/whats-new",
          },
        });

      } catch (error) {
        console.error('Error fetching new content:', error);
        // Show simple welcome toast on error
        toast("Welcome back! 👋", {
          description: "Great to see you again!",
          duration: 4000,
        });
      }
    };

    // Small delay to let the page load first
    const timer = setTimeout(checkAndShowWelcome, 1500);
    return () => clearTimeout(timer);
  }, [hasShown]);

  return null; // This component doesn't render anything visible
};

export default WelcomeBackToast;
