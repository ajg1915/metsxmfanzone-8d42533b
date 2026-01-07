import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, Play } from "lucide-react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";

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
        .limit(4);
      
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
      <section className="py-8 sm:py-10 md:py-12">
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
      <section className="py-8 sm:py-10 md:py-12 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            <h2 className="font-bold text-lg sm:text-xl md:text-2xl text-foreground">
              Live & Upcoming Streams
            </h2>
            <Button 
              variant="outline" 
              onClick={() => navigate("/mets-gamecast")}
              size="sm"
              className="text-xs sm:text-sm glass-card border-border/30 hover:border-primary/50"
            >
              View Mets Gamecast
            </Button>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {streams.map((stream, index) => (
              <GlassCard
                key={stream.id}
                variant="interactive"
                glow="blue"
                delay={index * 0.1}
                className="cursor-pointer group"
              >
                <div onClick={() => handleStreamClick(stream)}>
                  {stream.thumbnail_url && (
                    <div className="aspect-video overflow-hidden relative">
                      <img 
                        src={stream.thumbnail_url} 
                        alt={stream.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                        <Badge className={`text-[8px] sm:text-[10px] px-1.5 py-0.5 font-semibold backdrop-blur-sm ${
                          stream.status === 'live' 
                            ? 'bg-red-600/90 text-white shadow-lg shadow-red-600/50' 
                            : 'bg-secondary/80 text-secondary-foreground'
                        }`}>
                          {stream.status === 'live' && <Radio className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5 animate-pulse" />}
                          {stream.status === 'live' ? 'LIVE' : 'UPCOMING'}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <div className="p-2 sm:p-2.5">
                    <h3 className="line-clamp-1 text-xs sm:text-sm font-semibold group-hover:text-primary transition-colors">
                      {stream.title}
                    </h3>
                  </div>
                  <div className="px-2 pb-2 sm:px-2.5 sm:pb-2.5">
                    <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground">
                      <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary mr-1" />
                      {stream.viewers_count > 0 ? `${stream.viewers_count}` : 'Soon'}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-4 sm:mt-6"
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
