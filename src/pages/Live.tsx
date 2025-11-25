import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Newspaper } from "lucide-react";
import { TVGuideChannel } from "@/components/TVGuideChannel";
import { TVScheduleCard } from "@/components/TVScheduleCard";

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

interface TVSchedule {
  id: string;
  network: string;
  show_title: string;
  description?: string;
  time_slot: string;
  is_live: boolean;
}

interface PodcastLiveStream {
  id: string;
  title: string;
  description: string | null;
  vdo_ninja_url: string | null;
  is_live: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url?: string;
  published_at: string;
}

const Live = () => {
  const navigate = useNavigate();
  const { tier } = useSubscription();
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [tvSchedules, setTvSchedules] = useState<TVSchedule[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [podcastStream, setPodcastStream] = useState<PodcastLiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    if (tier === "free" || !tier) {
      setShowUpgradePrompt(true);
      return;
    }
    
    fetchStreams();
    fetchTVSchedules();
    fetchBlogPosts();
    fetchPodcastStream();

    // Set up realtime subscription for live_streams
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

    // Set up realtime subscription for podcast_live_stream
    const podcastChannel = supabase
      .channel('podcast-live-stream')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'podcast_live_stream'
        },
        () => {
          console.log('Podcast stream updated, refetching...');
          fetchPodcastStream();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(podcastChannel);
    };
  }, [tier]);

  const fetchStreams = async () => {
    try {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .eq("published", true)
        .in("status", ["live", "scheduled"])
        .order("scheduled_start", { ascending: true });

      if (error) throw error;
      setLiveStreams(data as LiveStream[] || []);
    } catch (error) {
      console.error("Error fetching streams:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTVSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("tv_schedules")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTvSchedules(data as TVSchedule[] || []);
    } catch (error) {
      console.error("Error fetching TV schedules:", error);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image_url, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setBlogPosts(data as BlogPost[] || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    }
  };

  const fetchPodcastStream = async () => {
    try {
      const { data, error } = await supabase
        .from("podcast_live_stream")
        .select("*")
        .eq("is_live", true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setPodcastStream(data);
    } catch (error) {
      console.error("Error fetching podcast stream:", error);
    }
  };

  const getStreamByPage = (pageName: string) => {
    return liveStreams.find(stream => 
      stream.assigned_pages.includes(pageName) && stream.status === 'live'
    );
  };

  const channels = [
    {
      name: "MetsXMFanZone",
      page: "metsxmfanzone",
      route: "/metsxmfanzone-tv",
      logo: "https://i.ibb.co/8gnsKFYN/250x.jpg"
    },
    {
      name: "MLB Network",
      page: "mlb-network",
      route: "/mlb-network",
      logo: "https://image.discovery.indazn.com/ca/v2/ca/image?id=oujgtbpdbgg41eb1ynteb1fg5_image-header_pDach_1661949080000&quality=70"
    },
    {
      name: "ESPN Network",
      page: "espn-network",
      route: "/espn-network",
      logo: "https://wallpapers.com/images/hd/incredible-espn-logo-lbluyg5qlvhnplyr.jpg"
    }
  ];

  if (tier === "free" || !tier) {
    return (
      <>
        <UpgradePrompt open={true} />
        <div className="min-h-screen bg-background">
          <Helmet>
            <title>Watch Mets Live Streams - Live Game Coverage & Analysis | MetsXMFanZone</title>
            <meta name="description" content="Watch New York Mets live streams, pre-game shows, post-game analysis, and exclusive fan content. Stream live Mets games and coverage 24/7." />
            <meta name="keywords" content="Mets live stream, watch Mets live, Mets game stream, live baseball, Mets pre-game, Mets post-game, MLB live stream" />
            <link rel="canonical" href="https://www.metsxmfanzone.com/live" />
          </Helmet>
          <Navigation />
          <main className="pt-16 flex items-center justify-center min-h-screen bg-gradient-to-b from-secondary/20 to-background">
            <div className="text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-3 sm:mb-4">
                Live TV Guide
              </h1>
              <p className="text-sm sm:text-base text-foreground max-w-2xl mx-auto">
                Your complete guide to Mets coverage across all networks
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8 sm:py-12">Loading TV guide...</div>
            ) : (
              <div className="space-y-8 mb-12">
                {/* Podcast Live Stream */}
                {podcastStream && podcastStream.vdo_ninja_url && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Badge variant="destructive" className="animate-pulse">
                        LIVE NOW
                      </Badge>
                      <h2 className="text-2xl font-bold text-primary">{podcastStream.title}</h2>
                    </div>
                    <Card className="border-2 border-primary">
                      <CardContent className="p-0">
                        <div className="aspect-video w-full">
                          <iframe
                            src={podcastStream.vdo_ninja_url}
                            allow="camera;microphone;display-capture;autoplay;clipboard-write"
                            className="w-full h-full rounded-lg"
                            title={podcastStream.title}
                          />
                        </div>
                        {podcastStream.description && (
                          <div className="p-4">
                            <p className="text-muted-foreground">{podcastStream.description}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* TV Guide Channels */}
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-6">Live Channels</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {channels.map((channel) => {
                      const liveStream = getStreamByPage(channel.page);
                      return (
                        <TVGuideChannel
                          key={channel.page}
                          channelName={channel.name}
                          channelLogo={channel.logo}
                          isLive={!!liveStream}
                          currentShow={liveStream?.title}
                          onWatch={() => navigate(channel.route)}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Latest Blog Updates */}
                {blogPosts.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                      <Newspaper className="w-6 h-6" />
                      Latest Updates
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {blogPosts.map((post) => (
                        <Card 
                          key={post.id}
                          className="border-2 border-primary/20 hover:border-primary transition-all cursor-pointer"
                          onClick={() => navigate(`/blog/${post.slug}`)}
                        >
                          {post.featured_image_url && (
                            <div className="aspect-video overflow-hidden">
                              <img 
                                src={post.featured_image_url} 
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <CardHeader>
                            <CardTitle className="text-base line-clamp-2">{post.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* TV Schedules */}
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-6">Today's Schedule</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TVScheduleCard 
                      network="ESPN Network"
                      schedules={tvSchedules.filter(s => s.network === "ESPN Network")}
                    />
                    <TVScheduleCard 
                      network="MLB Network"
                      schedules={tvSchedules.filter(s => s.network === "MLB Network")}
                    />
                  </div>
                </div>
              </div>
            )}

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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Live;
