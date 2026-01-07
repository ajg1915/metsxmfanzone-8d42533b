import { useState, useEffect } from "react";
import { Play, Film, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Video {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  description: string | null;
  duration: number | null;
  views: number | null;
  category: string | null;
}

interface HighlightsSectionProps {
  className?: string;
}

const HighlightsSection = ({ className }: HighlightsSectionProps) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("published", true)
        .eq("video_type", "highlight")
        .order("published_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching highlights:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || videos.length === 0) {
    return null;
  }

  return (
    <>
      <section className={cn("py-6 sm:py-8", className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-4 sm:mb-6"
          >
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                Mets Highlights
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

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {videos.map((video, index) => (
                <CarouselItem
                  key={video.id}
                  className="pl-3 md:pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4"
                >
                  <GlassCard
                    variant="interactive"
                    glow="blue"
                    delay={index * 0.05}
                    className="h-48 sm:h-56 md:h-64 cursor-pointer group overflow-hidden"
                  >
                    <div
                      className="relative w-full h-full"
                      onClick={() => setSelectedVideo(video)}
                    >
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Film className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                        </div>
                      </div>

                      {/* Duration badge */}
                      {video.duration && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm text-[10px] sm:text-xs font-medium text-foreground">
                          {formatDuration(video.duration)}
                        </div>
                      )}

                      {/* Title overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                        <p className="text-foreground text-xs sm:text-sm font-semibold line-clamp-2">
                          {video.title}
                        </p>
                        {video.views !== null && video.views > 0 && (
                          <p className="text-muted-foreground text-[10px] sm:text-xs mt-0.5">
                            {video.views.toLocaleString()} views
                          </p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 h-8 w-8 glass-card border-border/30 hover:border-primary/50" />
            <CarouselNext className="hidden md:flex -right-4 h-8 w-8 glass-card border-border/30 hover:border-primary/50" />
          </Carousel>
        </div>
      </section>

      {/* Video player dialog */}
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

export default HighlightsSection;
