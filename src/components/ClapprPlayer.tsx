import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Cast, Volume2, VolumeX } from "lucide-react";

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
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmuteBanner, setShowUnmuteBanner] = useState(true);

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
        video.play().catch(() => {
          // Autoplay blocked, muted autoplay should work
          video.muted = true;
          video.play().catch(() => {});
        });
      });
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari/iOS)
      video.src = source;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
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
      <div className="p-4 sm:p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">{pageTitle}</h3>
        <p className="text-sm text-muted-foreground">{pageDescription}</p>
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
            muted
            controls
            controlsList="nodownload"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Casting info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Cast className="w-3.5 h-3.5" />
          <span>
            AirPlay: Use the AirPlay icon in video controls (iOS/Safari). Chromecast: Use your browser's cast menu.
          </span>
        </div>
      </div>
    </div>
  );
}

export default ClapprPlayer;
