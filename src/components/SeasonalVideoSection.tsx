import { useState, useEffect, useCallback, useMemo } from "react";
import { Play, Film, ChevronRight, ChevronLeft, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface Video {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  thumbnail_gif_url?: string | null;
  description: string | null;
  duration: number | null;
  views: number | null;
  category: string | null;
}

const SPRING_TRAINING_END = new Date("2026-03-22T23:59:59");

const SeasonalVideoSection = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  const isSpringTraining = useMemo(() => new Date() <= SPRING_TRAINING_END, []);

  const fetchVideos = useCallback(async () => {
    try {
      let query = supabase
        .from("videos")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(12);

      if (isSpringTraining) {
        query = query.eq("category", "Spring Training");
      } else {
        query = query.eq("video_type", "highlight");
      }

      const { data, error } = await query;
      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching seasonal videos:", error);
    } finally {
      setLoading(false);
    }
  }, [isSpringTraining]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("seasonal-video-scroll");
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      const newPosition =
        direction === "left"
          ? Math.max(0, scrollPosition - scrollAmount)
          : scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollLeft);
  };

  if (loading || videos.length === 0) return null;

  const sectionTitle = isSpringTraining
    ? "Spring Training Videos"
    : "Mets Highlights";
  const SectionIcon = isSpringTraining ? Clapperboard : Film;

  return (
    <>
      <section className="py-6 sm:py-8 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <SectionIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                {sectionTitle}
              </h2>
            </div>
            <a
              href="/video-gallery"
              className="flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        <div className="relative group/carousel">
          {scrollPosition > 0 && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
            >
              <ChevronLeft className="w-8 h-8 text-foreground" />
            </button>
          )}

          <div
            id="seasonal-video-scroll"
            onScroll={handleScroll}
            className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-6 lg:px-8"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex-shrink-0 w-0 lg:w-[calc((100vw-1280px)/2)]" />

            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setSelectedVideo(video)}
                onMouseEnter={() => setHoveredVideoId(video.id)}
                onMouseLeave={() => setHoveredVideoId(null)}
                className="flex-shrink-0 w-[240px] sm:w-[280px] md:w-[320px] lg:w-[380px] cursor-pointer group"
              >
                <div className="relative overflow-hidden rounded-md sm:rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:z-10 group-hover:shadow-2xl group-hover:shadow-primary/20">
                  <div className="aspect-video relative">
                    {video.thumbnail_url ? (
                      <>
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className={cn(
                            "w-full h-full object-cover absolute inset-0 transition-opacity duration-300",
                            hoveredVideoId === video.id && video.thumbnail_gif_url
                              ? "opacity-0"
                              : "opacity-100"
                          )}
                        />
                        {video.thumbnail_gif_url && (
                          <img
                            src={video.thumbnail_gif_url}
                            alt={`${video.title} preview`}
                            className={cn(
                              "w-full h-full object-cover absolute inset-0 transition-opacity duration-300",
                              hoveredVideoId === video.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Film className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                      </div>
                    </div>

                    {video.duration && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-background/90 backdrop-blur-sm text-[10px] sm:text-xs font-medium text-foreground">
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-background to-transparent">
                    <p className="text-foreground text-xs sm:text-sm font-semibold line-clamp-2 group-hover:line-clamp-none transition-all">
                      {video.title}
                    </p>
                    {video.views !== null && video.views !== undefined && video.views > 0 && (
                      <p className="text-muted-foreground text-[10px] sm:text-xs mt-0.5">
                        {video.views.toLocaleString()} views
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="flex-shrink-0 w-0 lg:w-[calc((100vw-1280px)/2)]" />
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
          >
            <ChevronRight className="w-8 h-8 text-foreground" />
          </button>
        </div>
      </section>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] p-0 overflow-hidden glass-card border-border/30">
          {selectedVideo && (
            <div className="relative bg-background/90 w-full">
              <video
                src={selectedVideo.video_url}
                controls
                autoPlay
                playsInline
                className="w-full aspect-video"
              />
              <div className="p-3 sm:p-4">
                <h3 className="text-foreground text-sm sm:text-base font-bold">
                  {selectedVideo.title}
                </h3>
                {selectedVideo.description && (
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1 line-clamp-2">
                    {selectedVideo.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SeasonalVideoSection;
