import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export interface TVRailItem {
  id: string;
  title: string;
  thumbnail: string;
  badge?: string;
  subtitle?: string;
  isLive?: boolean;
}

interface TVContentRailProps {
  title: string;
  items: TVRailItem[];
  accent?: boolean;
  onItemClick?: (item: TVRailItem) => void;
}

export function TVContentRail({ title, items, accent }: TVContentRailProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2 py-2">
      {/* Rail header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {accent && (
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          )}
          <h3 className={cn(
            "text-sm font-semibold tracking-wide",
            accent ? "text-white" : "text-white/70"
          )}>
            {title}
          </h3>
        </div>
        <button className="flex items-center gap-0.5 text-[10px] text-white/30 hover:text-white/60 transition-colors">
          See All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Horizontal scroll rail */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
        {items.map((item) => (
          <button
            key={item.id}
            className="group shrink-0 w-[180px] rounded-md overflow-hidden bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {item.badge && (
                <Badge
                  className={cn(
                    "absolute top-1.5 left-1.5 text-[8px] px-1.5 py-0 h-4 leading-none border-0",
                    item.badge === "LIVE"
                      ? "bg-red-600 text-white"
                      : "bg-black/60 text-white/80 backdrop-blur-sm"
                  )}
                >
                  {item.badge === "LIVE" && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1" />
                  )}
                  {item.badge}
                </Badge>
              )}
              {/* Hover play indicator */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-2">
              <p className="text-[11px] font-medium text-white leading-tight line-clamp-1">
                {item.title}
              </p>
              {item.subtitle && (
                <p className="text-[9px] text-white/40 leading-tight line-clamp-1 mt-0.5">
                  {item.subtitle}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
