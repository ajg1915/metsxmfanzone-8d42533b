import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, Play, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiveStream {
  id: string;
  title: string;
  description: string;
  stream_url: string;
  thumbnail_url: string;
  status: 'live' | 'scheduled' | 'ended';
  scheduled_start: string;
  viewers_count: number;
  assigned_pages: string[];
}

const LiveStreamsSection = () => {
  const navigate = useNavigate();
  const { tier, isAdmin, loading: subscriptionLoading } = useSubscription();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    fetchStreams();

    const channel = supabase.channel('live-streams-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'live_streams'
    }, () => {
      fetchStreams();
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStreams = async () => {
    try {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .eq("published", true)
        .in("status", ["live", "scheduled"])
        .order("scheduled_start", { ascending: true })
        .limit(8);
      
      if (error) throw error;

      const sortedData = (data || []).sort((a, b) => {
        const aIsMets = a.assigned_pages.includes('metsxmfanzone');
        const bIsMets = b.assigned_pages.includes('metsxmfanzone');
        if (aIsMets && !bIsMets) return -1;
        if (!aIsMets && bIsMets) return 1;
        return 0;
      });
      
      setStreams(sortedData as LiveStream[]);
    } catch (error) {
      console.error("Error fetching streams:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStreamPageUrl = (stream: LiveStream) => {
    const networkPages = stream.assigned_pages.filter(page => page !== 'live' && page !== 'guide');
    if (networkPages.includes('metsxmfanzone')) return '/metsxmfanzone-tv';
    if (networkPages.includes('mlb-network')) return '/mlb-network';
    if (networkPages.includes('espn-network')) return '/espn-network';
    if (networkPages.includes('pix11-network')) return '/pix11-network';
    if (networkPages.includes('spring-training-live')) return '/spring-training-live';
    return '/live';
  };

  const handleStreamClick = (stream: LiveStream) => {
    if (subscriptionLoading) {
      navigate(getStreamPageUrl(stream));
      return;
    }
    if (isAdmin || tier === "premium" || tier === "annual") {
      navigate(getStreamPageUrl(stream));
    } else {
      setShowUpgradePrompt(true);
    }
  };

  const handleViewAllClick = () => {
    if (subscriptionLoading) {
      navigate("/live");
      return;
    }
    if (isAdmin || tier === "premium" || tier === "annual") {
      navigate("/live");
    } else {
      setShowUpgradePrompt(true);
    }
  };

  if (loading) {
    return (
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center text-muted-foreground">Loading live streams...</div>
        </div>
      </section>
    );
  }

  if (streams.length === 0) {
    return null;
  }

  return (
    <>
      <UpgradePrompt open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt} />
      <section className="py-6 sm:py-8 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 animate-pulse" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                Live & Upcoming Streams
              </h2>
            </div>
            <a
              href="/mets-gamecast"
              className="flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Mets Gamecast
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        {/* Netflix-style carousel container */}
        <div className="relative">
          {/* Scrollable content */}
          <div
            className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-6 lg:px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Add left padding spacer */}
            <div className="flex-shrink-0 w-0 lg:w-[calc((100vw-1280px)/2)]" />
            
            {streams.map((stream, index) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleStreamClick(stream)}
                className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px] cursor-pointer group"
              >
                <div className="relative overflow-hidden rounded-md sm:rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:z-10 group-hover:shadow-2xl group-hover:shadow-primary/20">
                  {/* Thumbnail */}
                  <div className="aspect-video relative">
                    {stream.thumbnail_url ? (
                      <img
                        src={stream.thumbnail_url}
                        alt={stream.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Radio className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-2 right-2">
                      <Badge className={cn(
                        "text-[10px] sm:text-xs px-1.5 py-0.5 font-semibold backdrop-blur-sm",
                        stream.status === 'live' 
                          ? 'bg-red-600/90 text-white shadow-lg shadow-red-600/50' 
                          : 'bg-secondary/80 text-secondary-foreground'
                      )}>
                        {stream.status === 'live' && <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" />}
                        {stream.status === 'live' ? 'LIVE' : 'UPCOMING'}
                      </Badge>
                    </div>

                    {/* Viewer count */}
                    {stream.viewers_count > 0 && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-background/90 backdrop-blur-sm text-[10px] sm:text-xs font-medium text-foreground flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary" />
                        {stream.viewers_count}
                      </div>
                    )}
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-background to-transparent">
                    <p className="text-foreground text-xs sm:text-sm font-semibold line-clamp-2">
                      {stream.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Add right padding spacer */}
            <div className="flex-shrink-0 w-0 lg:w-[calc((100vw-1280px)/2)]" />
          </div>
        </div>

        {/* View All button */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-4"
          >
            <Button 
              variant="outline" 
              onClick={handleViewAllClick}
              size="sm"
              className="text-xs sm:text-sm glass-card border-border/30 hover:border-primary/50"
            >
              View All Streams
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default LiveStreamsSection;
