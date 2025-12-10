import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, Play, Lock } from "lucide-react";
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

    // Set up realtime subscription
    const channel = supabase.channel('live-streams-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'live_streams'
    }, () => {
      console.log('Live streams updated, refetching...');
      fetchStreams();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const fetchStreams = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("live_streams").select("*").eq("published", true).in("status", ["live", "scheduled"]).order("scheduled_start", {
        ascending: true
      }).limit(4);
      if (error) throw error;

      // Sort to put MetsXMFanZone first
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
    // Filter out 'live' and get the first available network page
    const networkPages = stream.assigned_pages.filter(page => page !== 'live');
    if (networkPages.includes('metsxmfanzone')) return '/metsxmfanzone-tv';
    if (networkPages.includes('mlb-network')) return '/mlb-network';
    if (networkPages.includes('espn-network')) return '/espn-network';

    // Default fallback
    return '/live';
  };

  const handleStreamClick = (stream: LiveStream) => {
    // Don't show upgrade prompt while subscription is still loading
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
    // Don't show upgrade prompt while subscription is still loading
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
    return <section className="py-8 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading live streams...</div>
        </div>
      </section>;
  }
  if (streams.length === 0) {
    return null;
  }

  return (
    <>
      <UpgradePrompt open={showUpgradePrompt} />
      <section className="py-6 sm:py-8 md:py-10 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
            <h2 className="font-bold text-lg sm:text-xl md:text-2xl gradient-text">Live & Upcoming Streams</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate("/mets-gamecast")}
              size="sm"
              className="text-xs sm:text-sm border-secondary hover:bg-secondary hover:border-mets-blue-light"
            >
              View Mets Gamecast
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {streams.map((stream, index) => (
              <Card 
                key={stream.id} 
                className="border border-border/50 bg-gradient-to-br from-card to-secondary/30 overflow-hidden hover-glow cursor-pointer group transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleStreamClick(stream)}
              >
                {stream.thumbnail_url && (
                  <div className="aspect-video overflow-hidden relative">
                    <img 
                      src={stream.thumbnail_url} 
                      alt={stream.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                      <Badge className={`text-[8px] sm:text-[10px] px-1.5 py-0.5 font-semibold ${stream.status === 'live' ? 'bg-red-600 text-white shadow-lg shadow-red-600/50' : 'bg-secondary text-secondary-foreground'}`}>
                        {stream.status === 'live' && <Radio className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5 animate-pulse" />}
                        {stream.status === 'live' ? 'LIVE' : 'UPCOMING'}
                      </Badge>
                    </div>
                  </div>
                )}
                <CardHeader className="p-2 sm:p-2.5">
                  <CardTitle className="line-clamp-1 text-xs sm:text-sm group-hover:text-primary transition-colors">{stream.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-2.5 pt-0">
                  <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground">
                    <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-secondary mr-1" />
                    {stream.viewers_count > 0 ? `${stream.viewers_count}` : 'Soon'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center mt-4 sm:mt-6">
            <Button 
              variant="outline" 
              onClick={handleViewAllClick}
              size="sm"
              className="text-xs sm:text-sm border-secondary hover:bg-secondary hover:border-mets-blue-light"
            >
              View All Streams
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};
export default LiveStreamsSection;