import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";
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
  }, [pageName]);

  // Initialize Video.js player when stream changes
  useEffect(() => {
    if (stream && videoRef.current && !playerRef.current) {
      console.log('Initializing Video.js player for:', stream.stream_url);
      
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: 'muted',
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
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered vjs-theme-fantasy"
                style={{ width: '100%', height: '100%' }}
              />
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
