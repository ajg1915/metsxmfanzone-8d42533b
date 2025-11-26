import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Play, Clock, Eye, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  video_type: string;
  category: string;
  duration: number;
  views: number;
  published_at: string;
}

export default function VideoGallery() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading videos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const handleVideoClick = async (video: Video) => {
    setSelectedVideo(video);
    setDialogOpen(true);

    // Increment view count
    try {
      await supabase
        .from("videos")
        .update({ views: (video.views || 0) + 1 })
        .eq("id", video.id);
      
      // Update local state
      setVideos(prev => prev.map(v => 
        v.id === video.id ? { ...v, views: (v.views || 0) + 1 } : v
      ));
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  const filteredVideos = filter === "all" 
    ? videos 
    : videos.filter(v => v.category.toLowerCase() === filter.toLowerCase());

  const categories = ["all", ...Array.from(new Set(videos.map(v => v.category)))];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Video Gallery | MetsXMFanZone</title>
        <meta name="description" content="Watch exclusive Mets videos, highlights, and replays from MetsXMFanZone." />
      </Helmet>

      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent my-[45px]">
            Video Gallery
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Watch exclusive Mets content, highlights, and game replays
          </p>
        </div>

        {/* Category Filter */}
        <Tabs value={filter} onValueChange={setFilter} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)` }}>
            {categories.slice(0, 4).map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg">
                {filter === "all" 
                  ? "No videos available yet. Check back soon!"
                  : `No videos in the ${filter} category yet.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => (
              <Card 
                key={video.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => handleVideoClick(video)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail_url || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary rounded-full p-4">
                      <Play className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                  {video.duration > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize">
                      {video.category}
                    </Badge>
                    {video.views > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {video.views}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Video Player Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          {selectedVideo && (
            <>
              <DialogHeader className="p-6 pb-0">
                <div className="flex items-start justify-between gap-4">
                  <DialogTitle className="text-2xl">{selectedVideo.title}</DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDialogOpen(false)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="aspect-video w-full bg-black">
                {isYouTubeUrl(selectedVideo.video_url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(selectedVideo.video_url)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedVideo.video_url}
                    controls
                    autoPlay
                    className="w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <Badge variant="secondary" className="capitalize">
                    {selectedVideo.category}
                  </Badge>
                  {selectedVideo.views > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {selectedVideo.views} views
                    </div>
                  )}
                  {selectedVideo.duration > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDuration(selectedVideo.duration)}
                    </div>
                  )}
                </div>
                
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedVideo.description}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}