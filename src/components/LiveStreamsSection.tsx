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
    // Get the first assigned page and navigate to it
    if (stream.assigned_pages && stream.assigned_pages.length > 0) {
      const firstPage = stream.assigned_pages[0];
      if (firstPage === 'live') return '/live';
      if (firstPage === 'metsxmfanzone') return '/metsxmfanzone-tv';
      if (firstPage === 'mlb-network') return '/mlb-network';
    }
    return '/live'; // default fallback
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
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Live & Upcoming Streams</h2>
          <Button variant="outline" onClick={() => navigate("/live")}>
            View All Streams
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <Card 
              key={stream.id}
              className="border-2 border-primary bg-card overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
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
              <CardHeader>
                <CardTitle className="line-clamp-2">{stream.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {stream.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {stream.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {stream.viewers_count > 0 ? `${stream.viewers_count} watching` : 'Starting soon'}
                  </span>
                  {stream.scheduled_start && stream.status === 'scheduled' && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(stream.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
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
