import { useEffect, useRef, useId } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ClapprPlayerProps {
  source: string;
  pageTitle: string;
  pageDescription: string;
}

declare global {
  interface Window {
    Clappr: any;
  }
}

export function ClapprPlayer({ source, pageTitle, pageDescription }: ClapprPlayerProps) {
  const containerId = useId().replace(/:/g, "-");
  const domId = `clappr-${containerId}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const loadClappr = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.Clappr) {
          resolve();
          return;
        }
        const existing = document.querySelector('script[src*="clappr"]');
        if (existing) {
          existing.addEventListener("load", () => resolve());
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Clappr"));
        document.head.appendChild(script);
      });
    };

    let mounted = true;

    loadClappr().then(() => {
      if (!mounted || !containerRef.current) return;

      // Destroy previous instance if any
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      // Clear container before init
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      playerRef.current = new window.Clappr.Player({
        source,
        parentId: `#${domId}`,
        width: "100%",
        height: "100%",
        autoPlay: false,
        mute: false,
        playback: {
          playInline: true,
          controls: true,
          crossOrigin: "anonymous",
          hlsjsConfig: {
            enableWorker: true,
            lowLatencyMode: false,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          },
        },
        hlsPlayback: {
          preload: "metadata",
        },
        mediacontrol: {
          seekbar: "#FF5733",
          buttons: "#FFFFFF",
        },
        events: {
          onError: (error: any) => {
            console.error("[ClapprPlayer] Playback error:", error);
          },
          onReady: () => {
            console.log("[ClapprPlayer] Player ready");
          },
        },
      });
    }).catch((err) => {
      console.error("[ClapprPlayer] Failed to initialize:", err);
    });

    return () => {
      mounted = false;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore destroy errors during unmount
        }
        playerRef.current = null;
      }
    };
  }, [source, domId]);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">{pageTitle}</CardTitle>
        <CardDescription>{pageDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          id={domId}
          ref={containerRef}
          className="relative w-full bg-black rounded-lg overflow-hidden [&_video]:w-full [&_video]:h-full"
          style={{ minHeight: "320px", aspectRatio: "16/9" }}
        />
      </CardContent>
    </Card>
  );
}
