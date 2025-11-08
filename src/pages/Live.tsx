import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Radio, Users } from "lucide-react";

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
  published: boolean;
}

const Live = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
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
  }, [user]);

  const fetchStreams = async () => {
    try {
      // Check if user is admin
      let isAdmin = false;
      if (user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();
        
        isAdmin = !!roleData;
      }

      // Build query - admins see all, users see only published
      let query = supabase
        .from("live_streams")
        .select("*");

      // Only filter by published if not admin
      if (!isAdmin) {
        query = query.eq("published", true);
      }

      const { data, error } = await query
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

  const handleStreamClick = (assignedPages: string[]) => {
    if (!user) {
      toast.error("Please log in to watch streams");
      navigate("/auth");
      return;
    }

    if (!isPremium) {
      toast.error("Premium subscription required to watch streams");
      navigate("/plans");
      return;
    }

    const networkPages = assignedPages.filter(page => page !== 'live');
    
    let url = '/metsxmfanzone-tv';
    if (networkPages.includes('metsxmfanzone')) url = '/metsxmfanzone-tv';
    else if (networkPages.includes('mlb-network')) url = '/mlb-network';
    else if (networkPages.includes('espn-network')) url = '/espn-network';
    
    navigate(url);
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

            {loading ? (
              <div className="text-center py-8 sm:py-12">Loading live streams...</div>
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
                    onClick={() => handleStreamClick(stream.assigned_pages)}
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
                        <div className="flex gap-2">
                          <Badge className={stream.status === "live" ? "bg-red-600 text-white" : "bg-blue-600 text-white"}>
                            {stream.status === "live" ? (
                              <>
                                <Radio className="w-3 h-3 mr-1 animate-pulse" />
                                LIVE NOW
                              </>
                            ) : 'STARTING SOON'}
                          </Badge>
                          {!stream.published && (
                            <Badge variant="secondary" className="bg-yellow-600 text-white">
                              UNPUBLISHED
                            </Badge>
                          )}
                        </div>
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

            <div className="text-center">
              <Card className="border-2 border-primary bg-card max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Premium Access Required</CardTitle>
                  <CardDescription className="text-foreground">
                    Get unlimited access to all live streams, replays, and exclusive content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="lg" className="w-full md:w-auto">
                    Start 7-Day Free Trial
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Live;
