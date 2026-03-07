import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import { Play, Square, AlertCircle, CheckCircle, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function StreamTester() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [streamInfo, setStreamInfo] = useState<{ levels: number; currentLevel: string; duration: string } | null>(null);

  const cleanup = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    setStreamInfo(null);
  };

  const testStream = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast({ title: "Enter a URL", description: "Paste an M3U8 link to test.", variant: "destructive" });
      return;
    }

    cleanup();
    setStatus("loading");
    setErrorMsg("");

    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setStatus("error");
          setErrorMsg(`Fatal ${data.type}: ${data.details}`);
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setStreamInfo({
          levels: data.levels.length,
          currentLevel: data.levels[0]
            ? `${data.levels[0].width}x${data.levels[0].height}`
            : "unknown",
          duration: video.duration && isFinite(video.duration)
            ? `${Math.round(video.duration)}s`
            : "Live",
        });
        video.play()
          .then(() => setStatus("playing"))
          .catch(() => {
            video.muted = true;
            video.play()
              .then(() => setStatus("playing"))
              .catch(() => {
                setStatus("error");
                setErrorMsg("Autoplay blocked. Try clicking play on the video.");
              });
          });
      });

      hls.loadSource(trimmed);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = trimmed;
      video.addEventListener("loadedmetadata", () => {
        setStreamInfo({
          levels: 1,
          currentLevel: "native",
          duration: video.duration && isFinite(video.duration)
            ? `${Math.round(video.duration)}s`
            : "Live",
        });
        video.play()
          .then(() => setStatus("playing"))
          .catch(() => {
            setStatus("error");
            setErrorMsg("Playback failed on this device.");
          });
      }, { once: true });
      video.addEventListener("error", () => {
        setStatus("error");
        setErrorMsg("Native HLS playback error.");
      }, { once: true });
    } else {
      setStatus("error");
      setErrorMsg("HLS is not supported in this browser.");
    }
  };

  const stopStream = () => {
    cleanup();
    setStatus("idle");
    setErrorMsg("");
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  const statusIcon = {
    idle: <Link2 className="w-4 h-4 text-muted-foreground" />,
    loading: <Loader2 className="w-4 h-4 text-primary animate-spin" />,
    playing: <CheckCircle className="w-4 h-4 text-green-500" />,
    error: <AlertCircle className="w-4 h-4 text-destructive" />,
  };

  const statusLabel = {
    idle: "Ready",
    loading: "Connecting...",
    playing: "Playing",
    error: "Error",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">M3U8 Stream Tester</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste an M3U8 URL to test playback, check quality levels, and verify stream health.
        </p>
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          placeholder="https://example.com/stream/playlist.m3u8"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && testStream()}
          className="flex-1"
        />
        {status === "playing" || status === "loading" ? (
          <Button variant="destructive" onClick={stopStream} className="gap-2">
            <Square className="w-4 h-4" /> Stop
          </Button>
        ) : (
          <Button onClick={testStream} className="gap-2">
            <Play className="w-4 h-4" /> Test
          </Button>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
        {statusIcon[status]}
        <span className="text-sm font-medium text-foreground">{statusLabel[status]}</span>
        {streamInfo && (
          <div className="ml-auto flex gap-4 text-xs text-muted-foreground">
            <span>Qualities: {streamInfo.levels}</span>
            <span>Resolution: {streamInfo.currentLevel}</span>
            <span>Duration: {streamInfo.duration}</span>
          </div>
        )}
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Video Player */}
      <div className="relative w-full rounded-lg overflow-hidden bg-black border border-border" style={{ aspectRatio: "16/9" }}>
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          playsInline
          controlsList="nodownload"
        />
        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            Paste an M3U8 URL above and click Test
          </div>
        )}
      </div>

      {/* Quick test URLs */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-medium text-foreground">Quick Test URLs</p>
        {[
          { label: "Default Stream", url: "https://video1.getstreamhosting.com:1936/resyweugpd/resyweugpd/playlist.m3u8" },
          { label: "HLS Test (Apple)", url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setUrl(item.url)}
            className="block w-full text-left text-xs text-primary hover:underline truncate"
          >
            {item.label}: {item.url}
          </button>
        ))}
      </div>
    </div>
  );
}
