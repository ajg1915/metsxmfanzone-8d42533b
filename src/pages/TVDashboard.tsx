import { useState, useMemo, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { TVHeroBanner } from "@/components/tv/TVHeroBanner";
import { TVNavBar } from "@/components/tv/TVNavBar";
import { TVContentRail } from "@/components/tv/TVContentRail";
import { Skeleton } from "@/components/ui/skeleton";

export type TVCategory = "home" | "live" | "highlights" | "replays";

const TVDashboard = () => {
  const [activeCategory, setActiveCategory] = useState<TVCategory>("home");
  const navigate = useNavigate();

  const goToMetsTV = useCallback(() => navigate("/metsxmfanzone"), [navigate]);
  const goToSpring = useCallback(() => navigate("/spring-training-live"), [navigate]);

  const { data: liveStreams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ["tv-live-streams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true })
        .limit(12);
      if (error) throw error;
      return data;
    },
  });

  const { data: highlights = [], isLoading: highlightsLoading } = useQuery({
    queryKey: ["tv-highlights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("published", true)
        .eq("video_type", "highlight")
        .order("published_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
  });

  const { data: replays = [], isLoading: replaysLoading } = useQuery({
    queryKey: ["tv-replays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("replay_games")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
  });

  const { data: springGames = [], isLoading: springLoading } = useQuery({
    queryKey: ["tv-spring-training"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spring_training_games")
        .select("*")
        .eq("published", true)
        .order("game_date", { ascending: true })
        .limit(12);
      if (error) throw error;
      return data;
    },
  });

  const { data: stories = [], isLoading: storiesLoading } = useQuery({
    queryKey: ["tv-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true })
        .limit(12);
      if (error) throw error;
      return data;
    },
  });

  const isLoading = streamsLoading || highlightsLoading || replaysLoading || springLoading || storiesLoading;

  const liveItems = useMemo(() =>
    liveStreams.map((s) => ({
      id: s.id,
      title: s.title,
      thumbnail: s.thumbnail_url || "/placeholder.svg",
      badge: s.status === "live" ? "LIVE" : s.status === "scheduled" ? "Upcoming" : undefined,
      subtitle: s.description?.slice(0, 80) || "",
      streamUrl: s.stream_url,
      isLive: s.status === "live",
    })),
    [liveStreams]
  );

  const highlightItems = useMemo(() =>
    highlights.map((v: any) => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnail_url || "/placeholder.svg",
      subtitle: v.description?.slice(0, 80) || "",
    })),
    [highlights]
  );

  const replayItems = useMemo(() =>
    replays.map((r) => ({
      id: r.id,
      title: r.title,
      thumbnail: r.thumbnail_url || "/placeholder.svg",
      subtitle: r.description?.slice(0, 80) || "",
    })),
    [replays]
  );

  const springItems = useMemo(() =>
    springGames.map((g) => ({
      id: g.id,
      title: `Mets ${g.is_home_game ? 'vs' : '@'} ${g.opponent}`,
      thumbnail: g.preview_image_url || "/placeholder.svg",
      subtitle: `${g.game_date} • ${g.game_time || 'TBD'} • ${g.location || ''}`,
      badge: g.game_status === 'live' ? "LIVE" : g.game_status === 'final' ? "Final" : undefined,
    })),
    [springGames]
  );

  const resolvedStories = useMemo(() =>
    stories.map((s) => {
      const fileName = s.media_url.split('/stories/')[1] || s.media_url;
      const { data: urlData } = supabase.storage.from('stories').getPublicUrl(fileName);
      let thumbnailUrl = s.thumbnail_url;
      if (thumbnailUrl) {
        const thumbFileName = thumbnailUrl.split('/stories/')[1] || thumbnailUrl;
        const { data: thumbData } = supabase.storage.from('stories').getPublicUrl(thumbFileName);
        thumbnailUrl = thumbData?.publicUrl || thumbnailUrl;
      }
      return { ...s, media_url: urlData?.publicUrl || s.media_url, thumbnail_url: thumbnailUrl };
    }),
    [stories]
  );

  const storyItems = useMemo(() =>
    resolvedStories.map((s) => ({
      id: s.id,
      title: s.title,
      thumbnail: s.thumbnail_url || s.media_url || "/placeholder.svg",
      subtitle: s.media_type === 'video' ? 'Video Story' : 'Photo Story',
    })),
    [resolvedStories]
  );

  const [selectedStory, setSelectedStory] = useState<any>(null);

  const handleStoryClick = useCallback((item: any) => {
    const story = resolvedStories.find((s) => s.id === item.id);
    if (story) setSelectedStory(story);
  }, [resolvedStories]);

  const heroStream = liveStreams.find((s) => s.status === "live") || liveStreams[0];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6 px-6">
          <Skeleton className="h-[220px] w-full rounded-lg" />
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-28 w-48 shrink-0 rounded-md" />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    switch (activeCategory) {
      case "home":
        return (
          <>
            {heroStream && (
              <TVHeroBanner
                title={heroStream.title}
                description={heroStream.description || ""}
                thumbnail={heroStream.thumbnail_url || "/placeholder.svg"}
                streamUrl={heroStream.stream_url}
                isLive={heroStream.status === "live"}
              />
            )}
            <div className="space-y-1 px-6 pb-6 -mt-8 relative z-10">
              {liveItems.length > 0 && <TVContentRail title="Live Now" items={liveItems} accent onItemClick={goToMetsTV} />}
              {springItems.length > 0 && <TVContentRail title="Spring Training" items={springItems} onItemClick={goToSpring} />}
              {storyItems.length > 0 && <TVContentRail title="Stories" items={storyItems} onItemClick={handleStoryClick} />}
              {highlightItems.length > 0 && <TVContentRail title="Video Highlights" items={highlightItems} />}
              {replayItems.length > 0 && <TVContentRail title="Game Replays" items={replayItems} />}
            </div>
          </>
        );
      case "live":
        return (
          <div className="px-6 pt-4 pb-6">
            <TVContentRail title="Live Streams" items={liveItems} accent />
          </div>
        );
      case "highlights":
        return (
          <div className="px-6 pt-4 pb-6">
            <TVContentRail title="Video Highlights" items={highlightItems} />
          </div>
        );
      case "replays":
        return (
          <div className="px-6 pt-4 pb-6">
            <TVContentRail title="Game Replays" items={replayItems} />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Coming soon
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[hsl(220,20%,6%)] flex flex-col">
      <SEOHead
        title="TV Dashboard | MetsXMFanZone"
        description="Amazon TV-style dashboard for MetsXMFanZone streaming content."
        keywords="Mets TV, streaming, live games"
      />

      <TVNavBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {renderContent()}
      </main>

      {/* Story Viewer Dialog */}
      <Dialog open={!!selectedStory} onOpenChange={(open) => !open && setSelectedStory(null)}>
        <DialogContent className="max-w-lg p-0 bg-black border-white/10 overflow-hidden">
          <button
            onClick={() => setSelectedStory(null)}
            className="absolute top-3 right-3 z-50 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          {selectedStory && (
            <div className="flex flex-col">
              {selectedStory.media_type === "video" ? (
                <video
                  src={selectedStory.media_url}
                  controls
                  autoPlay
                  className="w-full aspect-video object-contain bg-black"
                />
              ) : (
                <img
                  src={selectedStory.media_url}
                  alt={selectedStory.title}
                  className="w-full aspect-video object-contain bg-black"
                />
              )}
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm">{selectedStory.title}</h3>
                <p className="text-white/50 text-xs mt-1">
                  {selectedStory.media_type === "video" ? "Video Story" : "Photo Story"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TVDashboard;
