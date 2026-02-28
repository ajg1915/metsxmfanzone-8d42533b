import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Music2, Facebook, Headphones, Music, Podcast, Radio, Mic, ArrowRight, Waves } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/metsxmfanzone-logo.png";
import PremiumBadge from "@/components/PremiumBadge";
import { useSubscription } from "@/hooks/useSubscription";

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  published_at: string;
}

const platforms = [
  { name: "TikTok", icon: Music2, url: "https://www.tiktok.com/@metsxmfanzone" },
  { name: "Facebook", icon: Facebook, url: "https://www.facebook.com/metsxmfanzone" },
  { name: "iHeartRadio", icon: Radio, url: "https://www.iheart.com" },
  { name: "Amazon Music", icon: Headphones, url: "https://music.amazon.com" },
  { name: "Spotify", icon: Music, url: "https://open.spotify.com" },
  { name: "Apple Podcasts", icon: Podcast, url: "https://podcasts.apple.com" },
];

const PodcastSection = () => {
  const { tier, isAdmin } = useSubscription();
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const isPremium = isAdmin || tier === "premium" || tier === "annual";

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    const { data } = await supabase
      .from("podcasts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(3);
    if (data) setPodcasts(data);
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[hsl(var(--mets-blue)/0.08)] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[hsl(var(--mets-orange)/0.06)] blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-[hsl(var(--mets-orange)/0.3)] blur-lg" />
              <div className="relative p-2.5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/20">
                <img src={logo} alt="MetsXMFanZone" className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                MetsXMFanZone Radio
              </h2>
              {!isPremium && <PremiumBadge size="md" noGlow />}
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
            Exclusive Mets content, game analysis, and fan discussions — all in one place
          </p>
        </div>

        {/* Live Banner */}
        <div className="mb-10 sm:mb-12">
          <div className="relative rounded-2xl overflow-hidden border border-[hsl(var(--mets-orange)/0.25)] bg-card/60 backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--mets-orange))] to-transparent" />
            <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[hsl(var(--mets-orange)/0.15)] flex items-center justify-center">
                  <Mic className="w-5 h-5 text-[hsl(var(--mets-orange))]" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[hsl(var(--mets-orange))] rounded-full animate-pulse border-2 border-card" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-foreground">
                  New episodes drop instantly when we go live!
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Follow us on any platform to get notified the moment a new episode is available.
                </p>
              </div>
              <Waves className="w-6 h-6 text-[hsl(var(--mets-orange)/0.4)] hidden sm:block animate-pulse" />
            </div>
          </div>
        </div>

        {/* Listen On Platforms */}
        <div className="mb-10 sm:mb-14">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mb-5 sm:mb-6">
            Listen Live On
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 max-w-3xl mx-auto">
            {platforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl bg-card/40 backdrop-blur-sm border border-border/10 hover:border-[hsl(var(--mets-blue)/0.4)] hover:bg-card/70 transition-all duration-300"
                >
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-[hsl(var(--mets-blue-light))] transition-colors" />
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {platform.name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Recent Episodes */}
        {podcasts.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mb-5 sm:mb-6">
              Recent Episodes
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              {podcasts.map((podcast, index) => (
                <div
                  key={podcast.id}
                  className="group relative rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border/10 hover:border-[hsl(var(--mets-blue)/0.3)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  {index === 0 && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[hsl(var(--mets-blue))] to-[hsl(var(--mets-orange))]" />
                  )}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-[hsl(var(--mets-blue)/0.12)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--mets-blue)/0.2)] transition-colors">
                        <Play className="w-5 h-5 text-[hsl(var(--mets-blue-light))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base sm:text-lg leading-snug line-clamp-2 text-foreground">
                          {podcast.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                          {podcast.description}
                        </p>
                      </div>
                    </div>
                    <audio controls className="w-full h-9 rounded-lg [&::-webkit-media-controls-panel]:bg-[hsl(var(--muted))]">
                      <source src={podcast.audio_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-xl border-border/30 hover:border-[hsl(var(--mets-blue)/0.5)] hover:bg-card/60 gap-2 group"
              >
                <Link to="/podcast">
                  View All Episodes
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PodcastSection;
