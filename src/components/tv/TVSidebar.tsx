import { cn } from "@/lib/utils";
import { Tv, Radio, Film, RotateCcw, Calendar, Users, Home } from "lucide-react";
import type { TVCategory } from "@/pages/TVDashboard";

interface TVSidebarProps {
  activeCategory: TVCategory;
  onCategoryChange: (cat: TVCategory) => void;
}

const categories: { key: TVCategory; label: string; icon: React.ElementType }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "live", label: "Live", icon: Radio },
  { key: "highlights", label: "Highlights", icon: Film },
  { key: "replays", label: "Replays", icon: RotateCcw },
];

export function TVSidebar({ activeCategory, onCategoryChange }: TVSidebarProps) {
  return (
    <aside className="w-14 shrink-0 bg-card/80 backdrop-blur border-r border-border/40 flex flex-col items-center py-3 gap-0.5">
      {/* Logo / brand mark */}
      <div className="mb-3 flex items-center justify-center">
        <Tv className="w-5 h-5 text-primary" />
      </div>

      {categories.map(({ key, label, icon: Icon }) => {
        const active = activeCategory === key;
        const isLive = key === "live";
        return (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={cn(
              "w-10 h-10 rounded-md flex flex-col items-center justify-center gap-0.5 transition-all text-[9px] font-medium",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
            title={label}
          >
            <div className="relative">
              <Icon className="w-3.5 h-3.5" />
              {isLive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className="leading-none">{label}</span>
          </button>
        );
      })}
    </aside>
  );
}
