import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Cast, Volume2, VolumeX, Tv } from "lucide-react";

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
  const hlsRef = useRef<Hls | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showUnmuteBanner, setShowUnmuteBanner] = useState(false);
  const [isCasting, setIsCasting] = useState(false);

  // Initialize Chromecast when available
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

    // Listen for Cast API readiness
    (window as any).__onGCastApiAvailable = (isAvailable: boolean) => {
      if (isAvailable) initChromecast();
    };

    // If already loaded
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.muted = false;
        video.play().then(() => {
          setIsMuted(false);
          setShowUnmuteBanner(false);
        }).catch(() => {
          video.muted = true;
          setIsMuted(true);
          setShowUnmuteBanner(true);
          video.play().catch(() => {});
        });
      });
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", () => {
        video.muted = false;
        video.play().then(() => {
          setIsMuted(false);
          setShowUnmuteBanner(false);
        }).catch(() => {
          video.muted = true;
          setIsMuted(true);
          setShowUnmuteBanner(true);
          video.play().catch(() => {});
        });
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [source]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted) {
      setShowUnmuteBanner(false);
      video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
    }
  };

  return (
    <div className="mb-8 rounded-lg border border-border bg-card overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{pageTitle}</h3>
          <p className="text-sm text-muted-foreground">{pageDescription}</p>
        </div>
        {/* Cast button */}
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

        <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            autoPlay
            controls
            controlsList="nodownload"
            // @ts-ignore - webkit AirPlay attribute
            x-webkit-airplay="allow"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Casting info */}
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
