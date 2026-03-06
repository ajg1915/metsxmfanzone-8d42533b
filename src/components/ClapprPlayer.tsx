import { useEffect, useRef, useId } from "react";

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
  const containerId = useRef(`clappr-${Math.random().toString(36).slice(2, 9)}`);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const initPlayer = () => {
      const el = document.getElementById(containerId.current);
      if (!el || !window.Clappr) return false;

      // Destroy existing player first
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.Clappr.Player({
        source,
        parentId: `#${containerId.current}`,
        width: "100%",
        height: "100%",
        autoPlay,
      });
      return true;
    };

    if (!initPlayer()) {
      // Retry until Clappr CDN loads
      let attempts = 0;
      const retry = () => {
        attempts++;
        if (attempts > 10) return;
        if (!initPlayer()) {
          retryTimer = setTimeout(retry, 500);
        }
      };
      retryTimer = setTimeout(retry, 500);
    }

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [source, autoPlay]);

  return (
    <div className="mb-8 rounded-lg border border-border bg-card overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">{pageTitle}</h3>
        <p className="text-sm text-muted-foreground">{pageDescription}</p>
      </div>
      <div className="p-4 sm:p-6">
        <div
          id={containerId.current}
          ref={containerRef}
          className="relative w-full min-h-[240px] sm:min-h-[320px] landscape:min-h-[50vh] bg-black rounded-lg overflow-hidden [&>div]:!w-full [&>div]:!h-full [&>div]:!absolute"
          style={{ aspectRatio: "16/9" }}
        />
      </div>
    </div>
  );
}

export default ClapprPlayer;
