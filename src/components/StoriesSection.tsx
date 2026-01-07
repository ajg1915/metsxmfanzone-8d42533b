import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import GlassCard from "@/components/GlassCard";

interface Story {
  id: string;
  title: string;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url: string | null;
  duration: number | null;
  created_at: string;
  link_url: string | null;
}

const StoriesSection = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      const storiesWithUrls = await Promise.all(
        (data || []).map(async (story) => {
          const fileName = story.media_url.split('/stories/')[1] || story.media_url;
          const { data: urlData } = await supabase.storage
            .from('stories')
            .createSignedUrl(fileName, 3600);

          let thumbnailUrl = story.thumbnail_url;
          if (thumbnailUrl) {
            const thumbFileName = thumbnailUrl.split('/stories/')[1] || thumbnailUrl;
            const { data: thumbData } = await supabase.storage
              .from('stories')
              .createSignedUrl(thumbFileName, 3600);
            thumbnailUrl = thumbData?.signedUrl || thumbnailUrl;
          }

          return {
            ...story,
            media_type: story.media_type as 'image' | 'video',
            media_url: urlData?.signedUrl || story.media_url,
            thumbnail_url: thumbnailUrl
          };
        })
      );
      setStories(storiesWithUrls);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || stories.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">
              MetsXMFanZone Stories
            </h2>
            <Link 
              to="/mets-scores" 
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Mets Scores</span>
              <span className="sm:hidden">Scores</span>
            </Link>
          </motion.div>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-7xl mx-auto"
          >
            <CarouselContent className="-ml-3 md:-ml-6">
              {stories.map((story, index) => {
                const handleClick = () => {
                  if (story.link_url) {
                    window.open(story.link_url, '_blank', 'noopener,noreferrer');
                  } else {
                    setSelectedStory(story);
                  }
                };

                return (
                  <CarouselItem 
                    key={story.id} 
                    className="pl-3 md:pl-6 basis-1/2 sm:basis-1/3 lg:basis-1/4"
                  >
                    <GlassCard
                      variant="interactive"
                      glow="blue"
                      delay={index * 0.05}
                      className="h-56 sm:h-72 md:h-80 lg:h-96 cursor-pointer group"
                    >
                      <div 
                        className="relative w-full h-full"
                        onClick={handleClick}
                      >
                        <img 
                          src={story.media_type === 'video' && story.thumbnail_url ? story.thumbnail_url : story.media_url} 
                          alt={story.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                        
                        {story.media_type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                              <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                          <p className="text-foreground text-[10px] sm:text-xs font-semibold truncate">
                            {story.title}
                          </p>
                          <p className="text-muted-foreground text-[9px] sm:text-[10px]">
                            {new Date(story.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 h-8 w-8 glass-card border-border/30 hover:border-primary/50" />
            <CarouselNext className="hidden md:flex -right-4 h-8 w-8 glass-card border-border/30 hover:border-primary/50" />
          </Carousel>
        </div>
      </div>

      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="w-[92vw] max-w-sm sm:max-w-md max-h-[80vh] p-0 overflow-hidden glass-card border-border/30">
          {selectedStory && (
            <div className="relative bg-background/80 w-full animate-scale-in">
              {selectedStory.media_type === 'video' ? (
                <video 
                  src={selectedStory.media_url} 
                  controls 
                  autoPlay 
                  playsInline 
                  muted={false} 
                  className="w-full h-auto max-h-[50vh] object-contain"
                />
              ) : (
                <img 
                  src={selectedStory.media_url} 
                  alt={selectedStory.title} 
                  className="w-full h-auto max-h-[50vh] object-contain" 
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-2 sm:p-3">
                <h3 className="text-foreground text-xs sm:text-sm font-bold truncate">
                  {selectedStory.title}
                </h3>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoriesSection;
