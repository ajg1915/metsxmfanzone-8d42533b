import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Radio, Users, Play, ChevronRight, ChevronLeft, X, Volume2, VolumeX } from "lucide-react";
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const [previewStream, setPreviewStream] = useState<LiveStream | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Long press handlers
  const handleLongPressStart = useCallback((stream: LiveStream) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      // Only show preview for live streams with premium access
      if (stream.status === 'live' && (isAdmin || tier === "premium" || tier === "annual")) {
        setPreviewStream(stream);
      }
    }, 500); // 500ms for long press
  }, [isAdmin, tier]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((stream: LiveStream) => {
    handleLongPressEnd();
    // If it was a long press, don't navigate
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    handleStreamClick(stream);
  }, [handleLongPressEnd]);

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

  const handleViewScheduleClick = () => {
    navigate("/mets-schedule-2026");
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('streams-scroll');
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollLeft);
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
        <div className="relative group/carousel">
          {/* Left arrow */}
          {scrollPosition > 0 && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
            >
              <ChevronLeft className="w-8 h-8 text-foreground" />
            </button>
          )}

          {/* Scrollable content */}
          <div
            id="streams-scroll"
            onScroll={handleScroll}
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
                onMouseDown={() => handleLongPressStart(stream)}
                onMouseUp={() => handleTouchEnd(stream)}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={() => handleLongPressStart(stream)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleTouchEnd(stream);
                }}
                onContextMenu={(e) => e.preventDefault()}
                className="flex-shrink-0 w-[240px] sm:w-[280px] md:w-[320px] lg:w-[380px] cursor-pointer group select-none"
              >
                <div className="relative overflow-hidden rounded-md sm:rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:z-10 group-hover:shadow-2xl group-hover:shadow-primary/20">
                  {/* Thumbnail */}
                  <div className="aspect-video relative">
                    {stream.thumbnail_url ? (
                      <img
                        src={stream.thumbnail_url}
                        alt={stream.title}
                        className="w-full h-full object-cover"
                        draggable={false}
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

                    {/* Long press hint for live streams */}
                    {stream.status === 'live' && (isAdmin || tier === "premium" || tier === "annual") && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-background/70 backdrop-blur-sm text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        Hold to preview
                      </div>
                    )}

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

          {/* Right arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
          >
            <ChevronRight className="w-8 h-8 text-foreground" />
          </button>
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
              onClick={handleViewScheduleClick}
              size="sm"
              className="text-xs sm:text-sm glass-card border-border/30 hover:border-primary/50 text-[#ff4500]"
            >
              View Full 2026 Schedule
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stream Preview Dialog */}
      <Dialog open={!!previewStream} onOpenChange={(open) => !open && setPreviewStream(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
          {previewStream && (
            <div className="relative">
              {/* Close button */}
              <button
                onClick={() => setPreviewStream(null)}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>

              {/* Video player */}
              <div className="aspect-video relative bg-black">
                <video
                  ref={videoRef}
                  src={previewStream.stream_url}
                  autoPlay
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-contain"
                  onError={() => console.log('Video preview error')}
                />
                
                {/* Live badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-600/90 text-white shadow-lg shadow-red-600/50 text-xs px-2 py-0.5">
                    <Radio className="w-3 h-3 mr-1 animate-pulse" />
                    LIVE PREVIEW
                  </Badge>
                </div>

                {/* Mute toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-foreground" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-foreground" />
                  )}
                </button>
              </div>

              {/* Stream info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-foreground mb-1">{previewStream.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{previewStream.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  {previewStream.viewers_count > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      {previewStream.viewers_count} watching
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      setPreviewStream(null);
                      handleStreamClick(previewStream);
                    }}
                    className="ml-auto"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Watch Full Stream
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LiveStreamsSection;
