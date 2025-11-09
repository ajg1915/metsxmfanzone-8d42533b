import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, Play } from "lucide-react";

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
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreams();

    // Set up realtime subscription
    const channel = supabase
      .channel('live-streams-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_streams'
        },
        () => {
          console.log('Live streams updated, refetching...');
          fetchStreams();
        }
      )
      .subscribe();

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
        .limit(3);

      if (error) throw error;
      setStreams(data as LiveStream[] || []);
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

  if (loading) {
    return (
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading live streams...</div>
        </div>
      </section>
    );
  }

  if (streams.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold">Live & Upcoming Streams</h2>
          <Button variant="outline" onClick={() => navigate("/live")}>
            View All Streams
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {streams.map((stream) => (
            <Card 
              key={stream.id}
              className="border-2 border-primary bg-card overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => navigate(getStreamPageUrl(stream))}
            >
              {stream.thumbnail_url && (
                <div className="aspect-video overflow-hidden relative">
                  <img 
                    src={stream.thumbnail_url} 
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className={stream.status === 'live' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}>
                      {stream.status === 'live' && <Radio className="w-3 h-3 mr-1 animate-pulse" />}
                      {stream.status === 'live' ? 'LIVE NOW' : 'UPCOMING'}
                    </Badge>
                  </div>
                </div>
              )}
              <CardHeader className="p-4">
                <CardTitle className="line-clamp-2">{stream.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {stream.viewers_count > 0 ? stream.viewers_count : 'Starting soon'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveStreamsSection;
