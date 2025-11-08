import { useState, useEffect, useRef } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Search, Filter, Eye, Clock } from "lucide-react";
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

const Gallery = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  if (authLoading || subLoading || adminLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isPremium && !isAdmin) {
    return <Navigate to="/plans" replace />;
  }

  const categories = ["All", ...new Set(videos.map(v => v.category))];
  const types = ["All", ...new Set(videos.map(v => v.video_type))];

  useEffect(() => {
    fetchVideos();
  }, [isAdmin]);

  useEffect(() => {
    const videoId = searchParams.get('video');
    if (videoId && videos.length > 0) {
      const video = videos.find(v => v.id === videoId);
      if (video) {
        handleVideoClick(video);
        setSearchParams({});
      }
    }
  }, [searchParams, videos]);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery, selectedCategory, selectedType]);

  useEffect(() => {
    if (selectedVideo && videoRef.current && isPlayerOpen) {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }

      setTimeout(() => {
        if (videoRef.current) {
          try {
            playerRef.current = videojs(videoRef.current, {
              controls: true,
              autoplay: true,
              preload: 'auto',
              fluid: true,
              responsive: true,
              sources: [{
                src: selectedVideo.video_url,
                type: 'video/mp4'
              }]
            });

            playerRef.current.ready(() => {
              console.log('Video player ready');
            });

            playerRef.current.on('error', (error: any) => {
              console.error('Video player error:', error);
              toast({
                title: "Video Error",
                description: "Failed to load video. Please try again.",
                variant: "destructive",
              });
            });

            incrementViews(selectedVideo.id);
          } catch (error) {
            console.error('Failed to initialize video player:', error);
            toast({
              title: "Player Error",
              description: "Failed to initialize video player.",
              variant: "destructive",
            });
          }
        }
      }, 100);
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch (e) {
          console.error('Error disposing player:', e);
        }
        playerRef.current = null;
      }
    };
  }, [selectedVideo, isPlayerOpen]);

  const fetchVideos = async () => {
    try {
      let query = supabase
        .from("videos")
        .select("*");

      // Only filter by published status if not admin
      if (!isAdmin) {
        query = query.eq("published", true);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast({
        title: "Error",
        description: "Failed to load videos",
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

    if (selectedType !== "All") {
      filtered = filtered.filter(v => v.video_type === selectedType);
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

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Mets Highlights & Game Videos - Watch HD Replays | MetsXMFanZone</title>
          <meta name="description" content="Watch Mets game highlights, full game replays, and exclusive video content. Browse HD quality Mets videos, best plays, and memorable moments." />
          <meta name="keywords" content="Mets highlights, Mets videos, Mets replays, baseball highlights, Mets best plays, game replays, Mets gallery" />
          <link rel="canonical" href="https://www.metsxmfanzone.com/gallery" />
        </Helmet>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-muted-foreground">Loading videos...</p>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Mets Highlights & Game Videos - Watch HD Replays | MetsXMFanZone</title>
        <meta name="description" content="Watch Mets game highlights, full game replays, and exclusive video content. Browse HD quality Mets videos, best plays, and memorable moments." />
        <meta name="keywords" content="Mets highlights, Mets videos, Mets replays, baseball highlights, Mets best plays, game replays, Mets gallery" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/gallery" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navigation />
      <main className="pt-20 sm:pt-24">
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
                Video Gallery
              </h1>
              <p className="text-base sm:text-lg text-foreground max-w-2xl mx-auto px-4">
                Explore our complete collection of videos, highlights, and exclusive content
              </p>
            </div>

            <div className="max-w-4xl mx-auto mb-6 sm:mb-8 w-full">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input 
                    placeholder="Search videos..." 
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

              <div className="flex flex-col gap-3 sm:gap-4 mt-3 sm:mt-4">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">Category:</span>
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
                <div className="flex gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">Type:</span>
                  {types.map((type) => (
                    <Badge 
                      key={type}
                      className={`cursor-pointer transition-colors ${
                        type === selectedType 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                      }`}
                      onClick={() => setSelectedType(type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {filteredVideos.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-muted-foreground text-base sm:text-lg px-4">
                  {searchQuery || selectedCategory !== "All" || selectedType !== "All"
                    ? "No videos found matching your criteria" 
                    : "No videos available yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                      <div className="flex gap-2 mb-2">
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          {video.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {video.video_type}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-primary mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>{formatViews(video.views || 0)} views</span>
                      </div>
                    </CardContent>
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
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{formatViews(selectedVideo?.views || 0)} views</span>
              </div>
              <Badge>{selectedVideo?.category}</Badge>
              <Badge variant="secondary">{selectedVideo?.video_type}</Badge>
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
    </>
  );
};

export default Gallery;
