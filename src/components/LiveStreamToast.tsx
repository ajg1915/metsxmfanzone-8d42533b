import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LiveStreamToast = () => {
  const navigate = useNavigate();
  const shownStreamIds = useRef<Set<string>>(new Set());
  const shownPodcastLive = useRef<boolean>(false);

  useEffect(() => {
    // Listen for live_streams going live
    const liveStreamsChannel = supabase
      .channel('live-stream-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_streams',
        },
        (payload) => {
          const newStream = payload.new as any;
          
          if (
            newStream?.status === 'live' && 
            newStream?.published === true &&
            !shownStreamIds.current.has(newStream.id)
          ) {
            shownStreamIds.current.add(newStream.id);
            
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                  <span>We're Live!</span>
                </div>
              ) as any,
              description: newStream.title || "A live stream just started!",
              action: (
                <button
                  onClick={() => navigate('/metsxmfanzone')}
                  className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Watch Now
                </button>
              ),
              duration: 10000,
            });
          }
        }
      )
      .subscribe();

    // Listen for podcast live stream going live
    const podcastChannel = supabase
      .channel('podcast-live-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'podcast_live_stream',
        },
        (payload) => {
          const newPodcast = payload.new as any;
          
          if (
            newPodcast?.is_live === true && 
            !shownPodcastLive.current
          ) {
            shownPodcastLive.current = true;
            
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                  <span>Podcast is Live!</span>
                </div>
              ) as any,
              description: newPodcast.title || "The podcast just went live!",
              action: (
                <button
                  onClick={() => navigate('/podcast')}
                  className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Listen Now
                </button>
              ),
              duration: 10000,
            });
          } else if (newPodcast?.is_live === false) {
            shownPodcastLive.current = false;
          }
        }
      )
      .subscribe();

    // Check for currently live streams on mount
    const checkCurrentlyLive = async () => {
      const { data: liveStreams } = await supabase
        .from('live_streams')
        .select('id, title')
        .eq('status', 'live')
        .eq('published', true);

      if (liveStreams && liveStreams.length > 0) {
        const stream = liveStreams[0];
        if (!shownStreamIds.current.has(stream.id)) {
          shownStreamIds.current.add(stream.id);
          
          toast({
            title: (
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                <span>We're Live!</span>
              </div>
            ) as any,
            description: stream.title || "A live stream is happening now!",
            action: (
              <button
                onClick={() => navigate('/metsxmfanzone')}
                className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Watch Now
              </button>
            ),
            duration: 10000,
          });
        }
      }

      const { data: podcastLive } = await supabase
        .from('podcast_live_stream')
        .select('is_live, title')
        .single();

      if (podcastLive?.is_live && !shownPodcastLive.current) {
        shownPodcastLive.current = true;
        
        toast({
          title: (
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-500 animate-pulse" />
              <span>Podcast is Live!</span>
            </div>
          ) as any,
          description: podcastLive.title || "The podcast is live now!",
          action: (
            <button
              onClick={() => navigate('/podcast')}
              className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Listen Now
            </button>
          ),
          duration: 10000,
        });
      }
    };

    checkCurrentlyLive();

    return () => {
      supabase.removeChannel(liveStreamsChannel);
      supabase.removeChannel(podcastChannel);
    };
  }, [navigate]);

  return null;
};
