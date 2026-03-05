import { useEffect, useMemo, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Mic, Radio, Music2, Facebook, Headphones, Music, Podcast as PodcastIcon, Video, Volume2, Maximize2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SocialShareButtons from "@/components/SocialShareButtons";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/metsxmfanzone-logo.png";
import SEOHead, { generatePodcastSchema } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";

interface PodcastEpisode {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration: number | null;
  published_at: string | null;
  created_at: string;
}

interface PodcastLiveStream {
  id: string;
  title: string;
  description: string | null;
  vdo_ninja_url: string | null;
  is_live: boolean;
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

const Podcast = () => {
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveStream, setLiveStream] = useState<PodcastLiveStream | null>(null);
  const [playerEnabled, setPlayerEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchEpisodes();
    fetchLiveStream();
    
    // Subscribe to live stream changes
    const channel = supabase
      .channel('podcast-live-stream')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'podcast_live_stream'
        },
        (payload) => {
          console.log('Podcast stream update:', payload);
          if (payload.new) {
            setLiveStream(payload.new as PodcastLiveStream);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const fetchLiveStream = async () => {
    try {
      const { data, error } = await supabase
        .from("podcast_live_stream")
        .select("*")
        .single();

      if (error) throw error;
      setLiveStream(data);
    } catch (error) {
      console.error("Error fetching live stream:", error);
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

  useEffect(() => {
    // Reset the embed when the stream link changes (new show / new VDO.Ninja link)
    setPlayerEnabled(false);
  }, [liveStream?.vdo_ninja_url]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const buildVdoNinjaUrl = (rawUrl: string, opts: { autostart?: boolean }) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return "";

    const [beforeHash, hash] = trimmed.split("#", 2);
    let base = beforeHash;
    let hasQuery = base.includes("?");

    const ensureFlag = (flag: string) => {
      if (base.includes(flag)) return;
      const sep = hasQuery ? (base.endsWith("?") || base.endsWith("&") ? "" : "&") : "?";
      base += `${sep}${flag}`;
      hasQuery = true;
    };

    // We only autostart after a user interaction; improves mobile audio reliability.
    if (opts.autostart) ensureFlag("autostart");

    return hash ? `${base}#${hash}` : base;
  };

  const vdoEmbedUrl = useMemo(() => {
    if (!liveStream?.vdo_ninja_url) return "";
    return buildVdoNinjaUrl(liveStream.vdo_ninja_url, { autostart: playerEnabled });
  }, [liveStream?.vdo_ninja_url, playerEnabled]);

  const vdoOpenUrl = useMemo(() => {
    if (!liveStream?.vdo_ninja_url) return "";
    return buildVdoNinjaUrl(liveStream.vdo_ninja_url, { autostart: true });
  }, [liveStream?.vdo_ninja_url]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      const el = playerContainerRef.current;
      if (!el || !el.requestFullscreen) {
        if (vdoOpenUrl) window.open(vdoOpenUrl, "_blank", "noopener,noreferrer");
        return;
      }

      await el.requestFullscreen();
    } catch (e) {
      console.warn("Fullscreen not available on this device/browser.", e);
      if (vdoOpenUrl) window.open(vdoOpenUrl, "_blank", "noopener,noreferrer");
    }
  };

  const liveShows = [
    {
      title: "MLB Network Live",
      description: "24/7 baseball coverage and analysis",
      path: "/mlb-network",
    },
    {
      title: "MetsXMFanZoneTV",
      description: "Exclusive Mets live content and discussions",
      path: "/metsxmfanzone",
    },
  ];

  // Generate PodcastSeries structured data
  const podcastSeriesSchema = {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    "name": "MetsXMFanZone Podcast",
    "description": "Listen to the best Mets podcasts, live shows, game analysis, and fan discussions. Daily Mets content featuring expert commentary and interviews.",
    "url": "https://www.metsxmfanzone.com/podcast",
    "image": "https://www.metsxmfanzone.com/logo-512.png",
    "author": {
      "@type": "Organization",
      "name": "MetsXMFanZone"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MetsXMFanZone",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.metsxmfanzone.com/logo-512.png"
      }
    },
    "webFeed": "https://www.metsxmfanzone.com/podcast/rss",
    "episode": episodes.slice(0, 10).map((ep) => ({
      "@type": "PodcastEpisode",
      "name": ep.title,
      "description": ep.description || ep.title,
      "datePublished": ep.published_at || ep.created_at,
      "url": ep.audio_url
    }))
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Mets Podcast - Live Shows & Exclusive Audio Content"
        description="Listen to the best Mets podcasts, live shows, game analysis, and fan discussions. Daily Mets content featuring expert commentary, player interviews, and breaking news coverage."
        keywords="Mets podcast, baseball podcast, Mets live show, Mets audio, MLB podcast, Mets commentary, Mets interviews, New York Mets radio, Mets talk show"
        canonical="https://www.metsxmfanzone.com/podcast"
        structuredData={podcastSeriesSchema}
      />
      <Navigation />
      <main className="pt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logo} alt="MetsXMFanZone" className="w-10 h-10 sm:w-12 sm:h-12" />
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
                MetsXMFanZone Podcast
              </h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Listen to exclusive Mets content, game analysis, and fan discussions
            </p>
          </div>

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

          {/* Live Podcast Stream */}
          {liveStream?.is_live && liveStream.vdo_ninja_url && (
            <section className="mb-8 sm:mb-12">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 animate-pulse" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">🔴 Live Now</h2>
                <Badge variant="destructive" className="animate-pulse ml-2">LIVE</Badge>
              </div>
              <Card className="border-2 border-red-500/50 bg-gradient-to-br from-red-500/5 to-orange-500/5">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                    <Video className="w-5 h-5 text-red-500" />
                    {liveStream.title}
                  </CardTitle>
                  {liveStream.description && (
                    <CardDescription className="text-xs sm:text-sm">{liveStream.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-2 sm:p-4">
                  <div className="mx-auto w-full max-w-5xl">
                    <div
                      ref={playerContainerRef}
                      className="relative w-full rounded-lg bg-muted"
                      style={
                        isFullscreen
                          ? { height: "100%" }
                          : { paddingBottom: "56.25%" }
                      }
                    >
                      {playerEnabled ? (
                        <iframe
                          src={vdoEmbedUrl}
                          className="absolute inset-0 h-full w-full rounded-lg"
                          style={{ border: "none" }}
                          allow="camera; microphone; autoplay; fullscreen; display-capture; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                          <p className="text-sm font-medium text-foreground">Ready to watch the live podcast?</p>
                          <p className="text-xs text-muted-foreground max-w-xs">
                            Tap start to enable audio reliably, then use the player controls for volume and fullscreen.
                          </p>
                          <Button type="button" onClick={() => setPlayerEnabled(true)} className="gap-2">
                            <Volume2 className="h-4 w-4" />
                            Start Stream
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground text-center sm:text-left">
                        If you don’t hear audio, tap inside the player and unmute.
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={toggleFullscreen}
                          disabled={!playerEnabled}
                        >
                          <Maximize2 className="h-4 w-4" />
                          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
                          <a href={vdoOpenUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Open
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Live Streams Section */}
          <section className="mb-8 sm:mb-12">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Live Shows</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {liveShows.map((show, index) => (
                <Card key={index} className="border-2 border-primary hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg md:text-xl">{show.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{show.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full gap-2 text-sm sm:text-base" size="lg" onClick={() => navigate(show.path)}>
                      <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                      Watch Live
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Social Share Section */}
          <section className="mb-8 sm:mb-12">
            <Card>
              <CardContent className="py-4 sm:py-6">
                <SocialShareButtons title="MetsXMFanZone Podcasts" />
              </CardContent>
            </Card>
          </section>

          {/* Podcast Episodes from Database */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">Recent Episodes</h2>
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
                <p className="text-muted-foreground">No podcast episodes available yet. Check back soon!</p>
              </Card>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Podcast;
