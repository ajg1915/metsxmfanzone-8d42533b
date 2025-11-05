import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    icon: "🎵",
    url: "https://www.tiktok.com/@metsxmfanzone",
    color: "bg-black hover:bg-black/80",
  },
  {
    name: "Facebook",
    icon: "📘",
    url: "https://www.facebook.com/metsxmfanzone",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    name: "Amazon Music",
    icon: "🎧",
    url: "https://music.amazon.com",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    name: "Spotify",
    icon: "🎶",
    url: "https://open.spotify.com",
    color: "bg-green-600 hover:bg-green-700",
  },
  {
    name: "Apple Podcasts",
    icon: "🎙️",
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
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-8 h-8 text-primary" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              MetsXMFanZone Podcast
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Listen to exclusive Mets content, game analysis, and fan discussions
          </p>
        </div>

        {/* Listen Live Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-6">Listen Live On</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {platforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-2">{platform.icon}</div>
                    <p className="font-semibold text-sm">{platform.name}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Episodes */}
        {podcasts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-center mb-6">Recent Episodes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
