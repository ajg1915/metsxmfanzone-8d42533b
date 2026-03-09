import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Cast, Tv } from "lucide-react";

interface NativeStreamPlayerProps {
  pageTitle?: string;
  pageDescription?: string;
  source?: string;
}

const DEFAULT_SOURCE = "https://video1.getstreamhosting.com:1936/resyweugpd/resyweugpd/playlist.m3u8";

export function ClapprPlayer({
  pageTitle = "Live Stream",
  pageDescription = "Watch live content",
  source = DEFAULT_SOURCE,
}: NativeStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showUnmuteBanner, setShowUnmuteBanner] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  // Initialize Chromecast
  useEffect(() => {
    const initChromecast = () => {
      const cast = (window as any).cast;
      const chrome = (window as any).chrome;
      if (!cast || !chrome?.cast) return;

      const sessionRequest = new chrome.cast.SessionRequest(
        chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
      );
      const apiConfig = new chrome.cast.ApiConfig(
        sessionRequest,
        (session: any) => {
          console.log("[Cast] Session established");
          setIsCasting(true);
        },
        (availability: string) => {
          console.log("[Cast] Receiver availability:", availability);
        }
      );
      chrome.cast.initialize(apiConfig,
        () => console.log("[Cast] Initialized"),
        (err: any) => console.warn("[Cast] Init error:", err)
      );
    };

    (window as any).__onGCastApiAvailable = (isAvailable: boolean) => {
      if (isAvailable) initChromecast();
    };
    if ((window as any).chrome?.cast) initChromecast();
  }, []);

  const startCasting = () => {
    const chrome = (window as any).chrome;
    if (!chrome?.cast) {
      alert("Chromecast is not available. Make sure you have a Chromecast device on your network.");
      return;
    }
    chrome.cast.requestSession(
      (session: any) => {
        setIsCasting(true);
        const mediaInfo = new chrome.cast.media.MediaInfo(source, "application/x-mpegURL");
        const request = new chrome.cast.media.LoadRequest(mediaInfo);
        session.loadMedia(request,
          () => console.log("[Cast] Media loaded"),
          (err: any) => console.error("[Cast] Media load error:", err)
        );
      },
      (err: any) => {
        if (err.code !== "cancel") console.error("[Cast] Request error:", err);
      }
    );
  };

  const supportsNativeHLS = () => {
    const video = document.createElement('video');
    return video.canPlayType('application/vnd.apple.mpegurl') !== '';
  };

  const disposePlayer = () => {
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
      setPlayerReady(false);
    }
  };

  // Initialize Video.js player
  useEffect(() => {
    if (!videoRef.current) return;

    // Wait a tick so the DOM element is fully mounted
    const initTimeout = setTimeout(() => {
      if (!videoRef.current || playerRef.current) return;

      const useNativeHLS = supportsNativeHLS();
      console.log('[ClapprPlayer] Initializing Video.js for:', source, '| Native HLS:', useNativeHLS);

      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: 'any',
        muted: false,
        preload: 'auto',
        fluid: true,
        liveui: true,
        playsinline: true,
        controlBar: {
          fullscreenToggle: true,
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
          nativeTextTracks: useNativeHLS,
        },
        liveTracker: {
          trackingThreshold: 0.5,
          liveTolerance: 15,
        },
        sources: [{
          src: source,
          type: 'application/x-mpegURL',
        }],
      });

      playerRef.current.ready(() => {
        console.log('[ClapprPlayer] Video.js player is ready');
        setPlayerReady(true);

        const p = playerRef.current;
        if (p.muted()) {
          setIsMuted(true);
          setShowUnmuteBanner(true);
        } else {
          setIsMuted(false);
          setShowUnmuteBanner(false);
        }

        // Auto-seek to live edge
        const liveEdgeInterval = setInterval(() => {
          const p = playerRef.current;
          if (!p || p.paused() || !p.liveTracker?.isLive?.()) return;
          const behindLive = p.liveTracker.liveCurrentTime() - p.currentTime();
          if (behindLive > 30) {
            console.log(`[ClapprPlayer] ${Math.round(behindLive)}s behind live, seeking to edge`);
            p.liveTracker.seekToLiveEdge();
          }
        }, 10000);

        playerRef.current.on('dispose', () => clearInterval(liveEdgeInterval));
      });

      // Capped retry with exponential backoff
      let retryCount = 0;
      const MAX_RETRIES = 3;
      playerRef.current.on('error', (e: any) => {
        console.error('[ClapprPlayer] Video.js error:', e);
        const error = playerRef.current?.error();
        if (error && retryCount < MAX_RETRIES) {
          retryCount++;
          const delay = Math.min(2000 * Math.pow(2, retryCount - 1), 16000);
          console.log(`[ClapprPlayer] Retry ${retryCount}/${MAX_RETRIES} in ${delay}ms`);
          setTimeout(() => {
            if (playerRef.current) {
              playerRef.current.src({ src: source, type: 'application/x-mpegURL' });
              playerRef.current.play();
            }
          }, delay);
        }
      });
    }, 50);

    return () => {
      clearTimeout(initTimeout);
      disposePlayer();
    };
  }, [source]);

  const toggleMute = () => {
    if (playerRef.current) {
      const newMutedState = !isMuted;
      playerRef.current.muted(newMutedState);
      setIsMuted(newMutedState);
      if (!newMutedState) {
        setShowUnmuteBanner(false);
        const playPromise = playerRef.current.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            console.log('[ClapprPlayer] Play after unmute failed, retrying muted');
            playerRef.current.muted(true);
            setIsMuted(true);
            playerRef.current.play();
          });
        }
      }
    }
  };

  return (
    <div className="mb-8 rounded-lg border border-border bg-card overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{pageTitle}</h3>
          <p className="text-sm text-muted-foreground">{pageDescription}</p>
        </div>
        <button
          onClick={startCasting}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-sm font-medium"
          title="Cast to TV"
        >
          {isCasting ? <Tv className="w-4 h-4" /> : <Cast className="w-4 h-4" />}
          <span className="hidden sm:inline">{isCasting ? "Casting" : "Cast"}</span>
        </button>
      </div>
      <div className="p-4 sm:p-6 space-y-3">
        {isMuted && showUnmuteBanner && (
          <div
            className="bg-primary/20 border-2 border-primary rounded-lg p-4 text-center cursor-pointer"
            onClick={toggleMute}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && toggleMute()}
          >
            <p className="sm:text-base mb-2 text-xs font-sans font-extralight text-center">
              🔊 Tap here to turn on audio
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Stream is muted by default for autoplay
            </p>
          </div>
        )}

        <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video landscape:max-h-[80vh] landscape:mx-auto landscape:w-full">
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered vjs-theme-fantasy"
            playsInline
            // @ts-ignore - webkit AirPlay attribute
            x-webkit-airplay="allow"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Cast className="w-3.5 h-3.5" />
          <span>
            Cast to TV via the Cast button above, AirPlay icon in controls (Apple), or your browser's cast menu (Chrome).
          </span>
        </div>
      </div>
    </div>
  );
}

export default ClapprPlayer;
