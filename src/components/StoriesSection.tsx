import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play } from "lucide-react";
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
      const {
        data,
        error
      } = await supabase.from("stories").select("*").eq("published", true).order("display_order", {
        ascending: true
      }).order("created_at", {
        ascending: false
      });
      if (error) throw error;

      // Get signed URLs for media
      const storiesWithUrls = await Promise.all((data || []).map(async story => {
        const fileName = story.media_url.split('/stories/')[1] || story.media_url;
        const {
          data: urlData
        } = await supabase.storage.from('stories').createSignedUrl(fileName, 3600); // 1 hour expiry

        let thumbnailUrl = story.thumbnail_url;
        if (thumbnailUrl) {
          const thumbFileName = thumbnailUrl.split('/stories/')[1] || thumbnailUrl;
          const {
            data: thumbData
          } = await supabase.storage.from('stories').createSignedUrl(thumbFileName, 3600);
          thumbnailUrl = thumbData?.signedUrl || thumbnailUrl;
        }
        return {
          ...story,
          media_type: story.media_type as 'image' | 'video',
          media_url: urlData?.signedUrl || story.media_url,
          thumbnail_url: thumbnailUrl
        };
      }));
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
  return <>
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">MetsXMFanZone Stories</h2>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {stories.map(story => {
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
                  className="flex-shrink-0 w-40 h-56 sm:w-44 sm:h-64 cursor-pointer overflow-hidden group border-2 border-primary/20 hover:border-primary transition-all relative" 
                  onClick={handleClick}
                >
                  <div className="relative w-full h-full">
                    <img 
                      src={story.media_type === 'video' && story.thumbnail_url ? story.thumbnail_url : story.media_url} 
                      alt={story.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    {story.media_type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">{story.title}</p>
                      <p className="text-white/70 text-[10px]">
                        {new Date(story.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl p-0 overflow-hidden">
          {selectedStory && <div className="relative bg-black w-full">
              {selectedStory.media_type === 'video' ? <video src={selectedStory.media_url} controls autoPlay className="w-full h-auto max-h-[85vh] object-contain" /> : <img src={selectedStory.media_url} alt={selectedStory.title} className="w-full h-auto max-h-[85vh] object-contain" />}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 sm:p-4">
                <h3 className="text-white text-sm sm:text-lg font-bold">{selectedStory.title}</h3>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </>;
};
export default StoriesSection;