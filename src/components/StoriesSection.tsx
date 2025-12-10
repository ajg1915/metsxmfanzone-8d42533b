import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      <section className="py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
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
          </div>
          <div className="relative">
            <div 
              ref={scrollContainerRef} 
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
            >
              {stories.map((story, index) => {
                const handleClick = () => {
                  if (story.link_url) {
                    window.open(story.link_url, '_blank', 'noopener,noreferrer');
                  } else {
                    setSelectedStory(story);
                  }
                };

                return (
                  <Card 
                    key={story.id} 
                    className="flex-shrink-0 w-32 h-44 sm:w-36 sm:h-52 md:w-44 md:h-64 cursor-pointer overflow-hidden group border border-border/50 hover:border-primary transition-all duration-300 relative snap-start hover-glow"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={handleClick}
                  >
                    <div className="relative w-full h-full">
                      <img 
                        src={story.media_type === 'video' && story.thumbnail_url ? story.thumbnail_url : story.media_url} 
                        alt={story.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                      
                      {story.media_type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
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
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 overflow-hidden border-border/50 glass">
          {selectedStory && (
            <div className="relative bg-background w-full animate-scale-in">
              {selectedStory.media_type === 'video' ? (
                <video 
                  src={selectedStory.media_url} 
                  controls 
                  autoPlay 
                  playsInline 
                  muted={false} 
                  className="w-full h-auto max-h-[80vh] sm:max-h-[85vh] object-contain" 
                />
              ) : (
                <img 
                  src={selectedStory.media_url} 
                  alt={selectedStory.title} 
                  className="w-full h-auto max-h-[80vh] sm:max-h-[85vh] object-contain" 
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-3 sm:p-4">
                <h3 className="text-foreground text-sm sm:text-base md:text-lg font-bold">
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
