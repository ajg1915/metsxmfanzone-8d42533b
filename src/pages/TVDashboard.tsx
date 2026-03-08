import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { TVHeroBanner } from "@/components/tv/TVHeroBanner";
import { TVNavBar } from "@/components/tv/TVNavBar";
import { TVContentRail } from "@/components/tv/TVContentRail";
import { Skeleton } from "@/components/ui/skeleton";

export type TVCategory = "home" | "live" | "highlights" | "replays" | "schedule" | "community";

const TVDashboard = () => {
  const [activeCategory, setActiveCategory] = useState<TVCategory>("home");

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

  const { data: heroSlides = [], isLoading: heroLoading } = useQuery({
    queryKey: ["tv-hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const isLoading = streamsLoading || highlightsLoading || replaysLoading || heroLoading;

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

  const featuredItems = useMemo(() =>
    heroSlides.map((h) => ({
      id: h.id,
      title: h.title,
      thumbnail: h.image_url || "/placeholder.svg",
      subtitle: h.description?.slice(0, 80) || "",
      badge: h.is_for_members ? "Members" : undefined,
    })),
    [heroSlides]
  );

  // Pick hero stream for banner
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
              {liveItems.length > 0 && <TVContentRail title="Live Now" items={liveItems} accent />}
              {featuredItems.length > 0 && <TVContentRail title="Featured" items={featuredItems} />}
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
    </div>
  );
};

export default TVDashboard;
