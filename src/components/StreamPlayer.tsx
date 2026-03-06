import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { StreamAlertBanner } from "./StreamAlertBanner";

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

export function StreamPlayer({
  pageName,
  pageTitle,
  pageDescription
}: StreamPlayerProps) {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmuteBanner, setShowUnmuteBanner] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    fetchStream();

    // Set up realtime subscription
    const channel = supabase.channel(`${pageName}-stream-changes`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'live_streams'
    }, () => {
      console.log('Stream updated, refetching...');
      fetchStream();
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
      // Dispose player on cleanup
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [pageName]);

  // Detect if the browser supports native HLS (Safari/iPad/iOS)
  const supportsNativeHLS = () => {
    const video = document.createElement('video');
    return video.canPlayType('application/vnd.apple.mpegurl') !== '';
  };

  // Dispose player helper
  const disposePlayer = () => {
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
      setPlayerReady(false);
    }
  };

  // Dispose player when pageName changes (navigating between stream pages)
  useEffect(() => {
    return () => {
      disposePlayer();
    };
  }, [pageName]);

  // Initialize Video.js player when stream changes
  useEffect(() => {
    if (stream && videoRef.current && !playerRef.current) {
      const useNativeHLS = supportsNativeHLS();
      console.log('Initializing Video.js player for:', stream.stream_url, '| Native HLS:', useNativeHLS);

      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: true,
        muted: true,
        preload: 'auto',
        fluid: true,
        liveui: true,
        playsinline: true,
        controlBar: {
          fullscreenToggle: true
        },
        html5: {
          vhs: {
            overrideNative: !useNativeHLS,
            fastQualityChange: true,
            handlePartialData: true,
            maxPlaylistRetries: 5,
            smoothQualityChange: false,
            allowSeeksWithinUnsafeLiveWindow: true,
            useNetworkInformationApi: false,
            ...(useNativeHLS ? {} : {
              bandwidth: 3000000,
              enableLowInitialPlaylist: true,
            }),
          },
          nativeVideoTracks: useNativeHLS,
          nativeAudioTracks: useNativeHLS,
          nativeTextTracks: useNativeHLS
        },
        liveTracker: {
          trackingThreshold: 1,
          liveTolerance: 20,
        },
        sources: [{
          src: stream.stream_url,
          type: 'application/x-mpegURL'
        }]
      });

      playerRef.current.ready(() => {
        console.log('Video.js player is ready');
        setPlayerReady(true);

        // Auto-seek to live edge periodically to prevent drift/lag
        const liveEdgeInterval = setInterval(() => {
          const p = playerRef.current;
          if (!p || p.paused() || !p.liveTracker?.isLive?.()) return;
          const behindLive = p.liveTracker.liveCurrentTime() - p.currentTime();
          if (behindLive > 30) {
            console.log(`[StreamPlayer] ${Math.round(behindLive)}s behind live, seeking to edge`);
            p.liveTracker.seekToLiveEdge();
          }
        }, 10000);

        playerRef.current.on('dispose', () => clearInterval(liveEdgeInterval));
      });

      // Capped retry with exponential backoff
      let retryCount = 0;
      const MAX_RETRIES = 3;
      playerRef.current.on('error', (e: any) => {
        console.error('Video.js error:', e);
        const error = playerRef.current?.error();
        if (error && retryCount < MAX_RETRIES) {
          retryCount++;
          const delay = Math.min(2000 * Math.pow(2, retryCount - 1), 16000);
          console.log(`Retry ${retryCount}/${MAX_RETRIES} in ${delay}ms`);
          setTimeout(() => {
            if (playerRef.current && stream) {
              playerRef.current.src({ src: stream.stream_url, type: 'application/x-mpegURL' });
              playerRef.current.play();
            }
          }, delay);
        } else if (retryCount >= MAX_RETRIES) {
          console.error('Max retries reached, stopping.');
        }
      });
    }

    return () => {
      disposePlayer();
    };
  }, [stream]);

  const toggleMute = () => {
    if (playerRef.current) {
      const newMutedState = !isMuted;
      playerRef.current.muted(newMutedState);
      setIsMuted(newMutedState);
      if (!newMutedState) {
        setShowUnmuteBanner(false);
        // On mobile, ensure playback continues after unmuting
        const playPromise = playerRef.current.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            console.log('Play after unmute failed, retrying muted');
            playerRef.current.muted(true);
            setIsMuted(true);
            playerRef.current.play();
          });
        }
      }
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
        <CardTitle className="text-lg">{pageTitle}</CardTitle>
        <CardDescription>{pageDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {stream ? (
          <div className="space-y-4">
            {/* Stream Alert Banner for viewers */}
            <StreamAlertBanner streamId={stream.id} />
            
            {isMuted && showUnmuteBanner && (
              <div 
                className="bg-primary/20 border-2 border-primary rounded-lg p-4 text-center cursor-pointer"
                onClick={toggleMute}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleMute()}
              >
                <p className="sm:text-base mb-2 text-xs font-sans font-extralight text-center">🔊 Tap here to turn on audio</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Stream is muted by default for autoplay</p>
              </div>
            )}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden landscape:max-h-[80vh] landscape:mx-auto landscape:w-full">
              <video 
                ref={videoRef} 
                className="video-js vjs-big-play-centered vjs-theme-fantasy" 
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
            <div>
              {stream.description && <p className="text-muted-foreground">{stream.description}</p>}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No live stream available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for live content.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
