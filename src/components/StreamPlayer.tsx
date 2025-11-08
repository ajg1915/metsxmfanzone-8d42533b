import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface LiveStream {
  id: string;
  title: string;
  description: string;
  stream_url: string;
  thumbnail_url: string;
  status: 'live' | 'scheduled' | 'ended';
  published: boolean;
}

interface StreamPlayerProps {
  pageName: string;
  pageTitle: string;
  pageDescription: string;
}

export function StreamPlayer({ pageName, pageTitle, pageDescription }: StreamPlayerProps) {
  const { user } = useAuth();
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
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

    return () => {
      supabase.removeChannel(channel);
      // Dispose player on cleanup
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [pageName, user]);

  // Initialize Video.js player when stream changes
  useEffect(() => {
    if (stream && videoRef.current && !playerRef.current) {
      console.log('Initializing Video.js player for:', stream.stream_url);
      
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: true,
        preload: 'auto',
        fluid: true,
        liveui: true,
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

  const fetchStream = async () => {
    try {
      // Check if user is admin
      let isAdmin = false;
      if (user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();
        
        isAdmin = !!roleData;
      }

      // Build query - admins see all, users see only published
      let query = supabase
        .from("live_streams")
        .select("*");

      // Only filter by published if not admin
      if (!isAdmin) {
        query = query.eq("published", true);
      }

      const { data, error } = await query
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
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered vjs-theme-fantasy"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div>
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold flex-1">{stream.title}</h3>
                {!stream.published && (
                  <Badge variant="secondary" className="bg-yellow-600 text-white">
                    UNPUBLISHED
                  </Badge>
                )}
              </div>
              {stream.description && (
                <p className="text-muted-foreground mt-2">{stream.description}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No Live Stream</p>
              <p className="text-muted-foreground">
                Stream will appear here when live
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
