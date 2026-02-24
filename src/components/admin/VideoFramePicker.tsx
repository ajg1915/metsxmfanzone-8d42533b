import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface VideoFramePickerProps {
  videoFile: File;
  onFrameSelect: (blob: Blob) => void;
  frameCount?: number;
}

interface FrameData {
  dataUrl: string;
  time: number;
  blob: Blob;
}

const VideoFramePicker = ({ videoFile, onFrameSelect, frameCount = 8 }: VideoFramePickerProps) => {
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const extractFrames = useCallback(async () => {
    setLoading(true);
    setFrames([]);
    setSelectedIndex(null);

    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load video"));
    });

    const duration = video.duration;
    if (!duration || duration <= 0) {
      setLoading(false);
      return;
    }

    // Generate evenly spaced timestamps (skip first/last 5%)
    const start = duration * 0.05;
    const end = duration * 0.95;
    const step = (end - start) / (frameCount - 1);
    const times = Array.from({ length: frameCount }, (_, i) => start + step * i);

    const extracted: FrameData[] = [];

    for (const time of times) {
      video.currentTime = time;
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
      );

      if (blob) {
        extracted.push({
          dataUrl: canvas.toDataURL("image/jpeg", 0.85),
          time,
          blob,
        });
      }
    }

    URL.revokeObjectURL(objectUrl);
    setFrames(extracted);
    setLoading(false);
  }, [videoFile, frameCount]);

  useEffect(() => {
    extractFrames();
  }, [extractFrames]);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onFrameSelect(frames[index].blob);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Extracting frames...</p>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: frameCount }).map((_, i) => (
            <div key={i} className="aspect-video rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (frames.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">Select a thumbnail frame</p>
      <div className="grid grid-cols-4 gap-2">
        {frames.map((frame, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSelect(i)}
            className={cn(
              "relative aspect-video rounded-md overflow-hidden border-2 transition-all cursor-pointer hover:opacity-90",
              selectedIndex === i
                ? "border-primary ring-2 ring-primary/30"
                : "border-transparent hover:border-muted-foreground/40"
            )}
          >
            <img
              src={frame.dataUrl}
              alt={`Frame at ${formatTime(frame.time)}`}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-background/80 text-foreground px-1 rounded">
              {formatTime(frame.time)}
            </span>
            {selectedIndex === i && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VideoFramePicker;
