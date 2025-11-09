import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Music2, Facebook, Headphones, Music, Podcast, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/metsxmfanzone-logo.png";

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  published_at: string;
}

const platforms = [
  {
    name: "TikTok",
    icon: Music2,
    url: "https://www.tiktok.com/@metsxmfanzone",
    color: "bg-black hover:bg-black/80",
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: "https://www.facebook.com/metsxmfanzone",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    name: "iHeartRadio",
    icon: Radio,
    url: "https://www.iheart.com",
    color: "bg-red-600 hover:bg-red-700",
  },
  {
    name: "Amazon Music",
    icon: Headphones,
    url: "https://music.amazon.com",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    name: "Spotify",
    icon: Music,
    url: "https://open.spotify.com",
    color: "bg-green-600 hover:bg-green-700",
  },
  {
    name: "Apple Podcasts",
    icon: Podcast,
    url: "https://podcasts.apple.com",
    color: "bg-purple-600 hover:bg-purple-700",
  },
];

const PodcastSection = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);

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

    if (data) {
      setPodcasts(data);
    }
  };

  return (
    <section className="py-6 sm:py-10 md:py-14 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <img src={logo} alt="MetsXMFanZone" className="w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              MetsXMFanZone Podcast
            </h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            Listen to exclusive Mets content, game analysis, and fan discussions
          </p>
        </div>

        {/* Listen Live Section */}
        <div className="mb-8 sm:mb-10">
          <h3 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6">Listen Live On</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2 max-w-5xl mx-auto">
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
                    <CardContent className="p-2 sm:p-2.5 text-center">
                      <div className="flex justify-center mb-0.5 sm:mb-1">
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <p className="font-semibold text-[10px] sm:text-xs">{platform.name}</p>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>

        {/* Recent Episodes */}
        {podcasts.length > 0 && (
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6">Recent Episodes</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              {podcasts.map((podcast) => (
                <Card key={podcast.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
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
                    <audio controls className="w-full">
                      <source src={podcast.audio_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button size="lg" asChild>
                <a href="/podcast">
                  View All Episodes
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PodcastSection;
