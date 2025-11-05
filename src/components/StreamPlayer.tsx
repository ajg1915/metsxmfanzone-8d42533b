import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

// @ts-ignore - Clappr doesn't have TypeScript definitions
import Clappr from "clappr";

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
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      // Destroy player on cleanup
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [pageName]);

  // Initialize Clappr player when stream changes
  useEffect(() => {
    if (stream && containerRef.current) {
      // Destroy existing player if any
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      // Create new Clappr player
      playerRef.current = new Clappr.Player({
        source: stream.stream_url,
        parent: containerRef.current,
        width: '100%',
        height: '100%',
        autoPlay: true,
        mute: false,
        playback: {
          playInline: true,
          recycleVideo: Clappr.Browser.isMobile,
        },
      });

      console.log('Clappr player initialized for:', stream.stream_url);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
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
            <div 
              ref={containerRef}
              className="aspect-video bg-black rounded-lg overflow-hidden"
              style={{ width: '100%', height: 'auto' }}
            />
            <div>
              <h3 className="text-lg font-semibold">{stream.title}</h3>
              {stream.description && (
                <p className="text-muted-foreground">{stream.description}</p>
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
