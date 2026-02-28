import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Music2, Facebook, Headphones, Music, Podcast, Radio, Mic, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/metsxmfanzone-logo.png";
import GlassCard from "@/components/GlassCard";
import PremiumBadge from "@/components/PremiumBadge";
import { useSubscription } from "@/hooks/useSubscription";
interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  published_at: string;
}
const platforms = [{
  name: "TikTok",
  icon: Music2,
  url: "https://www.tiktok.com/@metsxmfanzone"
}, {
  name: "Facebook",
  icon: Facebook,
  url: "https://www.facebook.com/metsxmfanzone"
}, {
  name: "iHeartRadio",
  icon: Radio,
  url: "https://www.iheart.com"
}, {
  name: "Amazon Music",
  icon: Headphones,
  url: "https://music.amazon.com"
}, {
  name: "Spotify",
  icon: Music,
  url: "https://open.spotify.com"
}, {
  name: "Apple Podcasts",
  icon: Podcast,
  url: "https://podcasts.apple.com"
}];
const PodcastSection = () => {
  const {
    tier,
    isAdmin
  } = useSubscription();
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const isPremium = isAdmin || tier === "premium" || tier === "annual";
  useEffect(() => {
    fetchPodcasts();
  }, []);
  const fetchPodcasts = async () => {
    const {
      data
    } = await supabase.from("podcasts").select("*").eq("published", true).order("published_at", {
      ascending: false
    }).limit(3);
    if (data) {
      setPodcasts(data);
    }
  };
  return <section className="py-10 sm:py-12 md:py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="gap-2 sm:gap-3 mb-3 sm:mb-4 flex items-center justify-start">
            <div className="p-2 rounded-xl glass-card">
              <img src={logo} alt="MetsXMFanZone" className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          <h2 className="sm:text-3xl lg:text-4xl font-bold text-lg">
            MetsXMFanZone Radio
          </h2>
            {!isPremium && <PremiumBadge size="md" noGlow />}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">Listen to exclusive Mets content, game 
 analysis, and fan discussions
        </p>
        </div>

        {/* Live Notification Banner */}
        <div className="mb-6 sm:mb-8">
          <GlassCard variant="interactive" glow="orange" className="border-orange-500/30">
            <div className="flex items-center gap-3 p-3 sm:p-4">
              <div className="relative flex-shrink-0">
                <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  🎙️ New episodes drop instantly when we go live!
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  Follow us on any platform below to get notified the moment a new podcast episode is available.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Listen Live Section */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h3 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6">
            Listen Live On
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 max-w-5xl mx-auto">
            {platforms.map((platform, index) => {
            const IconComponent = platform.icon;
            return <GlassCard key={platform.name} variant="interactive" glow="blue" delay={index * 0.05} className="group">
                  <a href={platform.url} target="_blank" rel="noopener noreferrer" className="block p-3 sm:p-4 text-center">
                    <div className="flex justify-center mb-1">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="font-semibold text-[10px] sm:text-xs">{platform.name}</p>
                  </a>
                </GlassCard>;
          })}
          </div>
        </div>

        {/* Recent Episodes */}
        {podcasts.length > 0 && <div>
            <h3 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6">
              Recent Episodes
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              {podcasts.map((podcast, index) => <GlassCard key={podcast.id} variant="default" glow="blue" delay={index * 0.1}>
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center flex-shrink-0">
                        <Play className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg mb-1 line-clamp-2">
                          {podcast.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {podcast.description}
                        </p>
                      </div>
                    </div>
                    <audio controls className="w-full rounded-lg">
                      <source src={podcast.audio_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </GlassCard>)}
            </div>
            <div className="text-center mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="glass-card border-primary/30 hover:border-primary/50">
                <Link to="/podcast">View All Episodes</Link>
              </Button>
            </div>
          </div>}
      </div>
    </section>;
};
export default PodcastSection;