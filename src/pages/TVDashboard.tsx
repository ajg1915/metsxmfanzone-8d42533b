import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { TVSidebar } from "@/components/tv/TVSidebar";
import { TVContentRow } from "@/components/tv/TVContentRow";
import { TVHeader } from "@/components/tv/TVHeader";
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

  const { data: podcasts = [], isLoading: podcastsLoading } = useQuery({
    queryKey: ["tv-podcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcast_shows")
        .select("*")
        .eq("published", true)
        .order("show_date", { ascending: false })
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

  const isLoading = streamsLoading || podcastsLoading || replaysLoading || heroLoading;

  const liveItems = useMemo(() =>
    liveStreams.map((s) => ({
      id: s.id,
      title: s.title,
      thumbnail: s.thumbnail_url || "/placeholder.svg",
      badge: s.status === "live" ? "LIVE" : s.status === "scheduled" ? "Upcoming" : undefined,
      subtitle: s.description?.slice(0, 60) || "",
    })),
    [liveStreams]
  );

  const podcastItems = useMemo(() =>
    podcasts.map((p) => ({
      id: p.id,
      title: p.title,
      thumbnail: p.thumbnail_url || "/placeholder.svg",
      badge: p.is_live ? "LIVE" : p.is_featured ? "Featured" : undefined,
      subtitle: p.description?.slice(0, 60) || "",
    })),
    [podcasts]
  );

  const replayItems = useMemo(() =>
    replays.map((r) => ({
      id: r.id,
      title: r.title,
      thumbnail: r.thumbnail_url || "/placeholder.svg",
      subtitle: r.description?.slice(0, 60) || "",
    })),
    [replays]
  );

  const featuredItems = useMemo(() =>
    heroSlides.map((h) => ({
      id: h.id,
      title: h.title,
      thumbnail: h.image_url || "/placeholder.svg",
      subtitle: h.description?.slice(0, 60) || "",
      badge: h.is_for_members ? "Members" : undefined,
    })),
    [heroSlides]
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 p-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <div className="flex gap-2 overflow-hidden">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-20 w-36 shrink-0 rounded" />
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
          <div className="space-y-3">
            {featuredItems.length > 0 && <TVContentRow title="Featured" items={featuredItems} />}
            {liveItems.length > 0 && <TVContentRow title="Live Now" items={liveItems} highlight />}
            {podcastItems.length > 0 && <TVContentRow title="Podcasts" items={podcastItems} />}
            {replayItems.length > 0 && <TVContentRow title="Game Replays" items={replayItems} />}
          </div>
        );
      case "live":
        return <TVContentRow title="Live Streams" items={liveItems} highlight />;
      case "highlights":
        return <TVContentRow title="Featured Highlights" items={featuredItems} />;
      case "podcasts":
        return <TVContentRow title="All Podcasts" items={podcastItems} />;
      case "replays":
        return <TVContentRow title="Game Replays" items={replayItems} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            Coming soon
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex">
      <SEOHead
        title="TV Dashboard | MetsXMFanZone"
        description="Netflix-style TV dashboard for MetsXMFanZone content."
        keywords="Mets TV, streaming, live games"
      />

      <TVSidebar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TVHeader />
        <main className="flex-1 overflow-y-auto p-3 space-y-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default TVDashboard;
