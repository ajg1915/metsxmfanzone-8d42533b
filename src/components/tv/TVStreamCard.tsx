import React from "react";
import { Play, Radio } from "lucide-react";
import { FocusableCard } from "./FocusableCard";
import { cn } from "@/lib/utils";

interface TVStreamCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  isLive?: boolean;
  row?: number;
  col?: number;
  onClick?: () => void;
}

export function TVStreamCard({
  id,
  title,
  description,
  thumbnailUrl,
  isLive = false,
  row,
  col,
  onClick
}: TVStreamCardProps) {
  return (
    <FocusableCard
      id={id}
      row={row}
      col={col}
      onClick={onClick}
      className="relative w-[420px] aspect-video rounded-2xl overflow-hidden glass-card"
    >
      {/* Thumbnail */}
      {thumbnailUrl ? (
        <img 
          src={thumbnailUrl} 
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary/50" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive px-4 py-2 rounded-lg">
          <Radio className="w-5 h-5 animate-pulse" />
          <span className="text-lg font-bold text-destructive-foreground">LIVE</span>
        </div>
      )}

      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl">
          <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
        </div>
      </div>

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-2xl font-bold text-foreground line-clamp-2">{title}</h3>
        {description && (
          <p className="text-lg text-muted-foreground line-clamp-1 mt-1">{description}</p>
        )}
      </div>
    </FocusableCard>
  );
}
