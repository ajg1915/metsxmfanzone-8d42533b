import { useEffect, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Load Clappr script if not already loaded
    const loadClappr = () => {
      return new Promise<void>((resolve) => {
        if (window.Clappr) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    let mounted = true;

    loadClappr().then(() => {
      if (!mounted || !containerRef.current || playerRef.current) return;

      playerRef.current = new window.Clappr.Player({
        source,
        parentId: `#clappr-container`,
        width: "100%",
        height: "100%",
        autoPlay: false,
        playback: {
          playInline: true,
        },
      });
    });

    return () => {
      mounted = false;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [source]);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">{pageTitle}</CardTitle>
        <CardDescription>{pageDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          id="clappr-container"
          ref={containerRef}
          className="relative w-full bg-black rounded-lg overflow-hidden"
          style={{ minHeight: "320px" }}
        />
      </CardContent>
    </Card>
  );
}
