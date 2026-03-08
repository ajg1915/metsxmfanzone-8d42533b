import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TVThumbnailItem {
  id: string;
  title: string;
  thumbnail: string;
  badge?: string;
  subtitle?: string;
}

interface TVContentRowProps {
  title: string;
  items: TVThumbnailItem[];
  highlight?: boolean;
}

export function TVContentRow({ title, items, highlight }: TVContentRowProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-1">
        {highlight && (
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        )}
        <h3 className={cn(
          "text-[11px] font-semibold tracking-wide",
          highlight ? "text-red-400" : "text-muted-foreground"
        )}>
          {title}
        </h3>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-border">
        {items.map((item) => (
          <button
            key={item.id}
            className="group shrink-0 w-[140px] rounded-md overflow-hidden bg-card/60 border border-border/30 hover:border-primary/40 hover:ring-1 hover:ring-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {item.badge && (
                <Badge
                  className={cn(
                    "absolute top-1 left-1 text-[8px] px-1 py-0 h-3.5 leading-none",
                    item.badge === "LIVE"
                      ? "bg-red-600 text-white border-0"
                      : "bg-background/80 text-foreground border-border/50"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            <div className="p-1.5">
              <p className="text-[10px] font-medium text-foreground leading-tight line-clamp-1">
                {item.title}
              </p>
              {item.subtitle && (
                <p className="text-[8px] text-muted-foreground leading-tight line-clamp-1 mt-0.5">
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
