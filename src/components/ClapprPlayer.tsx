import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Clappr: any;
  }
}

interface ClapprPlayerProps {
  source?: string;
  autoPlay?: boolean;
  pageTitle?: string;
  pageDescription?: string;
}

const DEFAULT_SOURCE = "https://video1.getstreamhosting.com:1936/resyweugpd/resyweugpd/playlist.m3u8";

export function ClapprPlayer({
  source = DEFAULT_SOURCE,
  autoPlay = false,
  pageTitle = "Live Stream",
  pageDescription = "Watch live content",
}: ClapprPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !window.Clappr) {
      // Retry if Clappr CDN hasn't loaded yet
      const retryTimeout = setTimeout(() => {
        if (containerRef.current && window.Clappr && !playerRef.current) {
          initPlayer();
        }
      }, 1000);
      return () => clearTimeout(retryTimeout);
    }

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [source]);

  const initPlayer = () => {
    if (!containerRef.current || !window.Clappr) return;

    // Destroy existing player first
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    playerRef.current = new window.Clappr.Player({
      source,
      parentId: `#${containerRef.current.id}`,
      width: "100%",
      height: "100%",
      autoPlay,
    });
  };

  return (
    <div className="mb-8 rounded-lg border border-border bg-card overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">{pageTitle}</h3>
        <p className="text-sm text-muted-foreground">{pageDescription}</p>
      </div>
      <div className="p-4 sm:p-6">
        <div
          id="clappr-player-container"
          ref={containerRef}
          className="relative w-full min-h-[240px] sm:min-h-[320px] landscape:min-h-[50vh] bg-black rounded-lg overflow-hidden"
          style={{ aspectRatio: "16/9" }}
        />
      </div>
    </div>
  );
}

export default ClapprPlayer;
