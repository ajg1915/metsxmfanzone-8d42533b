import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Mic, Radio, Users, MessageCircle, Heart, Share2, Music2, Facebook, Headphones, Music, Podcast as PodcastIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SocialShareButtons from "@/components/SocialShareButtons";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/metsxmfanzone-logo.png";

interface PodcastEpisode {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration: number | null;
  published_at: string | null;
  created_at: string;
}

const platforms = [
  {
    name: "TikTok",
    icon: Music2,
    url: "https://www.tiktok.com/@metsxmfanzone",
    color: "bg-black hover:bg-black/80"
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: "https://www.facebook.com/metsxmfanzone",
    color: "bg-blue-600 hover:bg-blue-700"
  },
  {
    name: "iHeartRadio",
    icon: Radio,
    url: "https://www.iheart.com",
    color: "bg-red-600 hover:bg-red-700"
  },
  {
    name: "Amazon Music",
    icon: Headphones,
    url: "https://music.amazon.com",
    color: "bg-orange-500 hover:bg-orange-600"
  },
  {
    name: "Spotify",
    icon: Music,
    url: "https://open.spotify.com",
    color: "bg-green-600 hover:bg-green-700"
  },
  {
    name: "Apple Podcasts",
    icon: PodcastIcon,
    url: "https://podcasts.apple.com",
    color: "bg-purple-600 hover:bg-purple-700"
  }
];

const communityFeatures = [
  {
    icon: MessageCircle,
    title: "Fan Discussions",
    description: "Join live discussions during episodes and share your thoughts"
  },
  {
    icon: Users,
    title: "Community Voices",
    description: "Hear from fellow Mets fans and community members"
  },
  {
    icon: Heart,
    title: "Fan Stories",
    description: "Share your Mets memories and experiences"
  },
  {
    icon: Share2,
    title: "Share & Connect",
    description: "Connect with other fans and share your favorite episodes"
  }
];

const CommunityPodcast = () => {
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      if (data) setEpisodes(data);
    } catch (error) {
      console.error("Error fetching podcasts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Community Podcast - Mets Fan Discussions & Stories | MetsXMFanZone</title>
        <meta
          name="description"
          content="Join the MetsXMFanZone community podcast featuring fan discussions, Mets stories, game analysis, and community voices. Your home for Mets fan content."
        />
        <meta
          name="keywords"
          content="Mets community podcast, Mets fan podcast, baseball community, Mets discussions, fan stories, MLB community"
        />
        <link rel="canonical" href="https://www.metsxmfanzone.com/community-podcast" />
      </Helmet>
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logo} alt="MetsXMFanZone" className="w-10 h-10 sm:w-12 sm:h-12" />
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
                Community Podcast
              </h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Your voice matters! Join our community-driven podcast featuring fan discussions, stories, and Mets coverage
            </p>
          </div>

          {/* Community Features */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6">What Makes Us Different</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {communityFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="border hover:border-primary transition-colors">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base mb-1">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Listen On Platforms */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6">Listen On</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 max-w-5xl mx-auto">
              {platforms.map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 border hover:border-primary">
                      <CardContent className="p-3 text-center">
                        <div className="flex justify-center mb-1">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <p className="font-semibold text-xs">{platform.name}</p>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </section>

          {/* Live Community Shows */}
          <section className="mb-8 sm:mb-12">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Live Community Shows</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-2 border-primary hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Fan Call-In Show
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Call in and share your thoughts on the latest Mets news
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full gap-2 text-sm sm:text-base" size="lg" onClick={() => navigate("/metsxmfanzone-tv")}>
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                    Join Live
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-2 border-primary hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Community Roundtable
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Weekly discussions with community members and special guests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full gap-2 text-sm sm:text-base" size="lg" onClick={() => navigate("/metsxmfanzone-tv")}>
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                    Watch Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Social Share Section */}
          <section className="mb-8 sm:mb-12">
            <Card>
              <CardContent className="py-4 sm:py-6">
                <SocialShareButtons title="MetsXMFanZone Community Podcast" />
              </CardContent>
            </Card>
          </section>

          {/* Community Episodes */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">Community Episodes</h2>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading episodes...</p>
            ) : episodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {episodes.map((episode) => (
                  <Card key={episode.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-full h-32 sm:h-40 bg-primary/10 rounded-md flex items-center justify-center mb-3 sm:mb-4">
                        <Mic className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                      </div>
                      <CardTitle className="text-sm sm:text-base md:text-lg line-clamp-2">{episode.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm line-clamp-2">
                        {episode.description || "No description available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        <span>{formatDuration(episode.duration)}</span>
                        <span>{formatDate(episode.published_at || episode.created_at)}</span>
                      </div>
                      <audio controls className="w-full">
                        <source src={episode.audio_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Mic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No community episodes available yet. Check back soon!</p>
              </Card>
            )}
          </section>

          {/* Call to Action */}
          <section className="mt-8 sm:mt-12">
            <Card className="bg-primary/5 border-primary">
              <CardContent className="p-6 sm:p-8 text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-2">Want to Be a Guest?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your Mets story, insights, or experiences on our community podcast!
                </p>
                <Button onClick={() => navigate("/contact")} className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Get in Touch
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityPodcast;
