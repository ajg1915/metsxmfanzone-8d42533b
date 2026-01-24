import React from "react";
import { Play, Clock, Headphones } from "lucide-react";
import { FocusableCard } from "./FocusableCard";

interface TVPodcastCardProps {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  publishedAt?: string;
  row?: number;
  col?: number;
  onClick?: () => void;
}

export function TVPodcastCard({
  id,
  title,
  description,
  duration,
  publishedAt,
  row,
  col,
  onClick
}: TVPodcastCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <FocusableCard
      id={id}
      row={row}
      col={col}
      onClick={onClick}
      className="w-[360px] p-6 rounded-2xl glass-card"
    >
      <div className="flex gap-5">
        {/* Podcast Icon */}
        <div className="flex-shrink-0 w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
          <Headphones className="w-12 h-12 text-primary-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-foreground line-clamp-2">{title}</h3>
          
          <div className="flex items-center gap-3 mt-2 text-muted-foreground">
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-base">{formatDuration(duration)}</span>
              </div>
            )}
            {publishedAt && (
              <span className="text-base">{formatDate(publishedAt)}</span>
            )}
          </div>
        </div>

        {/* Play Button */}
        <div className="flex-shrink-0 self-center">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Play className="w-7 h-7 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>

      {description && (
        <p className="text-lg text-muted-foreground mt-4 line-clamp-2">{description}</p>
      )}
    </FocusableCard>
  );
}
