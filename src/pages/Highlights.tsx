import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Share2, Play, Search, Filter, Eye, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import videojs from "video.js";
import "video.js/dist/video-js.css";

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
  published: boolean;
  created_at: string;
}

const Highlights = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  const categories = ["All", ...new Set(videos.map(v => v.category))];

  useEffect(() => {
    fetchVideos();
  }, []);

  // Auto-play video if videoId is in URL params
  useEffect(() => {
    const videoId = searchParams.get('video');
    if (videoId && videos.length > 0) {
      const video = videos.find(v => v.id === videoId);
      if (video) {
        handleVideoClick(video);
        // Remove the video param from URL after opening
        setSearchParams({});
      }
    }
  }, [searchParams, videos]);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery, selectedCategory]);

  useEffect(() => {
    if (selectedVideo && videoRef.current && isPlayerOpen && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: true,
        preload: 'auto',
        fluid: true,
        responsive: true,
        html5: {
          vhs: {
            overrideNative: true
          }
        }
      });

      playerRef.current.src({
        src: selectedVideo.video_url,
        type: 'video/mp4'
      });

      // Increment view count
      incrementViews(selectedVideo.id);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [selectedVideo, isPlayerOpen]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("published", true)
        .eq("video_type", "highlight")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast({
        title: "Error",
        description: "Failed to load highlight videos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(v => v.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVideos(filtered);
  };

  const incrementViews = async (videoId: string) => {
    try {
      const video = videos.find(v => v.id === videoId);
      if (video) {
        await supabase
          .from("videos")
          .update({ views: (video.views || 0) + 1 })
          .eq("id", videoId);
      }
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
    setTimeout(() => setSelectedVideo(null), 300);
  };

  const handleShare = (video: Video) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Video link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading highlights...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Game Highlights
              </h1>
              <p className="text-lg text-foreground max-w-2xl mx-auto">
                Watch the best moments, incredible plays, and unforgettable highlights from Mets games
              </p>
            </div>

            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input 
                    placeholder="Search highlights..." 
                    className="pl-10 border-2 border-primary bg-card"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap mt-4">
                {categories.map((category) => (
                  <Badge 
                    key={category}
                    className={`cursor-pointer transition-colors ${
                      category === selectedCategory 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {filteredVideos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchQuery || selectedCategory !== "All" 
                    ? "No highlights found matching your criteria" 
                    : "No highlights available yet"}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <Card 
                    key={video.id} 
                    className="border-2 border-primary bg-card overflow-hidden group hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="aspect-video overflow-hidden relative">
                      {video.thumbnail_url ? (
                        <img 
                          src={video.thumbnail_url} 
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Play className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-background/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                          <Play className="w-8 h-8 text-primary-foreground ml-1" />
                        </div>
                      </div>
                      {video.duration > 0 && (
                        <div className="absolute bottom-2 right-2 bg-background/90 px-2 py-1 rounded text-xs font-semibold text-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(video.duration)}
                        </div>
                      )}
                    </div>
                    <CardContent className="pt-4">
                      <Badge className="mb-2 bg-primary text-primary-foreground">
                        {video.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {video.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>{formatViews(video.views || 0)} views</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-4 pt-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast({
                            title: "Feature coming soon!",
                            description: "Like functionality will be available soon",
                          });
                        }}
                      >
                        <Heart className="w-4 h-4" />
                        Like
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(video);
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Dialog open={isPlayerOpen} onOpenChange={handleClosePlayer}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered vjs-theme-fantasy"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            {selectedVideo?.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedVideo.description}</p>
              </div>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{formatViews(selectedVideo?.views || 0)} views</span>
              </div>
              <Badge>{selectedVideo?.category}</Badge>
              {selectedVideo?.duration && selectedVideo.duration > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(selectedVideo.duration)}</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Highlights;
