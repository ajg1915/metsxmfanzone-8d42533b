import SEOHead from "@/components/SEOHead";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Play, Clock, Eye } from "lucide-react";
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
  const {
    toast
  } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);
  const fetchVideos = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("videos").select("*").eq("published", true).order("published_at", {
        ascending: false
      });
      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading videos",
        description: error.message,
        variant: "destructive"
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
    setPlayingVideoId(video.id);

    // Increment view count
    try {
      await supabase.from("videos").update({
        views: (video.views || 0) + 1
      }).eq("id", video.id);

      // Update local state
      setVideos(prev => prev.map(v => v.id === video.id ? {
        ...v,
        views: (v.views || 0) + 1
      } : v));
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };
  const filteredVideos = filter === "all" ? videos : videos.filter(v => v.category.toLowerCase() === filter.toLowerCase());
  const categories = ["all", ...Array.from(new Set(videos.map(v => v.category)))];
  
  if (authLoading || !user) {
    return null;
  }

  return <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Video Gallery | MetsXMFanZone</title>
        <meta name="description" content="Watch exclusive Mets videos, highlights, and replays from MetsXMFanZone." />
      </Helmet>

      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text my-[45px] text-primary">
            Video Gallery
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Watch exclusive Mets content, highlights, and game replays
          </p>
        </div>

        {/* Category Filter */}
        <Tabs value={filter} onValueChange={setFilter} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto" style={{
          gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)`
        }}>
            {categories.slice(0, 4).map(category => <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>)}
          </TabsList>
        </Tabs>

        {loading ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardContent>
              </Card>)}
          </div> : filteredVideos.length === 0 ? <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg">
                {filter === "all" ? "No videos available yet. Check back soon!" : `No videos in the ${filter} category yet.`}
              </p>
            </CardContent>
          </Card> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map(video => <Card key={video.id} className="overflow-hidden">
                {playingVideoId === video.id ? <div className="aspect-video w-full bg-black">
                    {isYouTubeUrl(video.video_url) ? <iframe src={getYouTubeEmbedUrl(video.video_url)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <video src={video.video_url} controls autoPlay playsInline controlsList="nodownload" className="w-full h-full">
                        Your browser does not support the video tag.
                      </video>}
                  </div> : <div className="relative cursor-pointer group" onClick={() => handleVideoClick(video)}>
                    <img src={video.thumbnail_url || "/placeholder.svg"} alt={video.title} className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-primary rounded-full p-4">
                        <Play className="h-8 w-8 text-primary-foreground" />
                      </div>
                    </div>
                    {video.duration > 0 && <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(video.duration)}
                      </div>}
                  </div>}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize">
                      {video.category}
                    </Badge>
                    {video.views > 0 && <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {video.views}
                      </div>}
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </main>

      <Footer />
    </div>;
}