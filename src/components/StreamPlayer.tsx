import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize } from "lucide-react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface LiveStream {
  id: string;
  title: string;
  description: string;
  stream_url: string;
  thumbnail_url: string;
  status: 'live' | 'scheduled' | 'ended';
}

interface StreamPlayerProps {
  pageName: string;
  pageTitle: string;
  pageDescription: string;
}

export function StreamPlayer({ pageName, pageTitle, pageDescription }: StreamPlayerProps) {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmuteBanner, setShowUnmuteBanner] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    fetchStream();

    // Set up realtime subscription
    const channel = supabase
      .channel(`${pageName}-stream-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_streams'
        },
        () => {
          console.log('Stream updated, refetching...');
          fetchStream();
        }
      )
      .subscribe();

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      // Dispose player on cleanup
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [pageName]);

  // Initialize Video.js player when stream changes
  useEffect(() => {
    if (stream && videoRef.current && !playerRef.current) {
      console.log('Initializing Video.js player for:', stream.stream_url);
      
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: true,
        muted: true,
        preload: 'auto',
        fluid: true,
        liveui: true,
        fullscreenToggle: true,
        controlBar: {
          fullscreenToggle: true
        },
        html5: {
          vhs: {
            overrideNative: true
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false
        },
        sources: [{
          src: stream.stream_url,
          type: 'application/x-mpegURL'
        }]
      });

      playerRef.current.ready(() => {
        console.log('Video.js player is ready');
      });

      playerRef.current.on('error', (e: any) => {
        console.error('Video.js error:', e);
        const error = playerRef.current.error();
        if (error) {
          console.error('Error details:', error.message, error.code);
        }
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [stream]);

  const toggleMute = () => {
    if (playerRef.current) {
      const newMutedState = !isMuted;
      playerRef.current.muted(newMutedState);
      setIsMuted(newMutedState);
      if (!newMutedState) {
        setShowUnmuteBanner(false);
      }
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        const element = containerRef.current;
        if (element) {
          if (element.requestFullscreen) {
            await element.requestFullscreen();
          } else if ((element as any).webkitRequestFullscreen) {
            await (element as any).webkitRequestFullscreen();
          }
          
          // Try to lock orientation to landscape on mobile
          if ('orientation' in screen && (screen.orientation as any).lock) {
            try {
              await (screen.orientation as any).lock('landscape');
            } catch {
              // Orientation lock not supported
            }
          }
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        
        // Unlock orientation
        if ('orientation' in screen && (screen.orientation as any).unlock) {
          try {
            (screen.orientation as any).unlock();
          } catch {
            // Orientation unlock not supported
          }
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const fetchStream = async () => {
    try {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .eq("published", true)
        .eq("status", "live")
        .contains("assigned_pages", [pageName])
        .order("scheduled_start", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setStream(data as LiveStream | null);
    } catch (error) {
      console.error("Error fetching stream:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="py-12 text-center">
          Loading stream...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl">{pageTitle}</CardTitle>
        <CardDescription>{pageDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {stream ? (
          <div className="space-y-4">
            {isMuted && showUnmuteBanner && (
              <div className="bg-primary/20 border-2 border-primary rounded-lg p-4 text-center animate-pulse">
                <p className="text-sm sm:text-base font-semibold mb-2">🔊 Tap the speaker icon in the player to hear audio</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Stream is muted by default for autoplay</p>
              </div>
            )}
            <div 
              ref={containerRef}
              className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'}`}
            >
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered vjs-theme-fantasy"
                style={{ width: '100%', height: '100%' }}
              />
              <Button
                onClick={toggleFullscreen}
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 z-50 bg-black/70 hover:bg-black/90 text-white shadow-lg"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen (rotates on mobile)"}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{stream.title}</h3>
              {stream.description && (
                <p className="text-muted-foreground">{stream.description}</p>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
