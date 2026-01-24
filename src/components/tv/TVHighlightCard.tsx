import React from "react";
import { Play, Clock } from "lucide-react";
import { FocusableCard } from "./FocusableCard";

interface TVHighlightCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration?: number;
  views?: number;
  row?: number;
  col?: number;
  onClick?: () => void;
}

export function TVHighlightCard({
  id,
  title,
  thumbnailUrl,
  duration,
  views,
  row,
  col,
  onClick
}: TVHighlightCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
  };

  return (
    <FocusableCard
      id={id}
      row={row}
      col={col}
      onClick={onClick}
      className="w-[320px] rounded-2xl overflow-hidden glass-card"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Duration Badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/90 px-2 py-1 rounded">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{formatDuration(duration)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-foreground line-clamp-2">{title}</h3>
        {views !== undefined && (
          <p className="text-base text-muted-foreground mt-1">{formatViews(views)}</p>
        )}
      </div>
    </FocusableCard>
  );
}
