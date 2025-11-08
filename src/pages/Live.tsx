import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Radio, Users, Lock } from "lucide-react";

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

const Live = () => {
  const navigate = useNavigate();
  const { isPremium, loading: subLoading } = useSubscription();
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreams();

    // Set up realtime subscription
    const channel = supabase
      .channel('live-page-streams')
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
        .contains("assigned_pages", ["live"])
        .order("scheduled_start", { ascending: true });

      if (error) throw error;
      setLiveStreams(data as LiveStream[] || []);
    } catch (error) {
      console.error("Error fetching streams:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStreamPageUrl = (assignedPages: string[]) => {
    // Filter out 'live' and get the first available network page
    const networkPages = assignedPages.filter(page => page !== 'live');
    
    if (networkPages.includes('metsxmfanzone')) return '/metsxmfanzone-tv';
    if (networkPages.includes('mlb-network')) return '/mlb-network';
    if (networkPages.includes('espn-network')) return '/espn-network';
    
    // Default fallback
    return '/metsxmfanzone-tv';
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Watch Mets Live Streams - Live Game Coverage & Analysis | MetsXMFanZone</title>
        <meta name="description" content="Watch New York Mets live streams, pre-game shows, post-game analysis, and exclusive fan content. Stream live Mets games and coverage 24/7." />
        <meta name="keywords" content="Mets live stream, watch Mets live, Mets game stream, live baseball, Mets pre-game, Mets post-game, MLB live stream" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/live" />
      </Helmet>
      <Navigation />
      <main className="pt-16 sm:pt-20">
        <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-secondary/20 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
                Live Streams
              </h1>
              <p className="text-base sm:text-lg text-foreground max-w-2xl mx-auto px-4">
                Watch live Mets coverage, pre-game shows, post-game analysis, and exclusive fan content
              </p>
            </div>

            {loading || subLoading ? (
              <div className="text-center py-8 sm:py-12">Loading live streams...</div>
            ) : !isPremium ? (
              <Card className="max-w-2xl mx-auto mb-12 border-2 border-primary">
                <CardContent className="py-12 text-center">
                  <Lock className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-2">Premium Access Required</h3>
                  <p className="text-muted-foreground mb-6">
                    Subscribe to unlock all live streaming content and exclusive coverage
                  </p>
                  <Button size="lg" onClick={() => navigate("/plans")}>
                    View Plans
                  </Button>
                </CardContent>
              </Card>
            ) : liveStreams.length === 0 ? (
              <Card className="max-w-2xl mx-auto mb-12">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No live or upcoming streams at the moment. Check back soon!
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-12">
                {liveStreams.map((stream) => (
                  <Card 
                    key={stream.id} 
                    className="border-2 border-primary bg-card hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => navigate(getStreamPageUrl(stream.assigned_pages))}
                  >
                    {stream.thumbnail_url && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={stream.thumbnail_url} 
                          alt={stream.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Radio className="w-8 h-8 text-primary" />
                        <Badge className={stream.status === "live" ? "bg-red-600 text-white" : "bg-blue-600 text-white"}>
                          {stream.status === "live" ? (
                            <>
                              <Radio className="w-3 h-3 mr-1 animate-pulse" />
                              LIVE NOW
                            </>
                          ) : 'STARTING SOON'}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-primary">{stream.title}</CardTitle>
                      <CardDescription className="text-foreground">
                        {stream.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {stream.viewers_count > 0 ? `${stream.viewers_count} watching` : 'Starting soon'}
                        </span>
                        <Button className="gap-2">
                          <Play className="w-4 h-4" />
                          Watch Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {isPremium && (
              <div className="text-center">
                <Card className="border-2 border-primary bg-card max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="text-2xl text-primary">Need More Access?</CardTitle>
                    <CardDescription className="text-foreground">
                      Upgrade for additional features and benefits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="lg" className="w-full md:w-auto" onClick={() => navigate("/plans")}>
                      View All Plans
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Live;
