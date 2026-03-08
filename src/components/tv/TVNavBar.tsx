import { cn } from "@/lib/utils";
import { Tv, Radio, Film, RotateCcw, Calendar, Users, Home, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setTVModePreference } from "@/hooks/use-device";
import { useNavigate } from "react-router-dom";
import type { TVCategory } from "@/pages/TVDashboard";

interface TVNavBarProps {
  activeCategory: TVCategory;
  onCategoryChange: (cat: TVCategory) => void;
}

const navItems: { key: TVCategory; label: string; icon: React.ElementType }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "live", label: "Live", icon: Radio },
  { key: "highlights", label: "Highlights", icon: Film },
  { key: "replays", label: "Replays", icon: RotateCcw },
  { key: "schedule", label: "Schedule", icon: Calendar },
  { key: "community", label: "Community", icon: Users },
];

export function TVNavBar({ activeCategory, onCategoryChange }: TVNavBarProps) {
  const navigate = useNavigate();

  return (
    <nav className="h-11 shrink-0 flex items-center justify-between px-6 bg-[hsl(220,20%,8%)]/95 backdrop-blur-md border-b border-white/5 z-50">
      {/* Left: Logo */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <Tv className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-white tracking-wider">
            Mets<span className="text-primary">XM</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-0.5">
          {navItems.map(({ key, label, icon: Icon }) => {
            const active = activeCategory === key;
            const isLive = key === "live";
            return (
              <button
                key={key}
                onClick={() => onCategoryChange(key)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-medium transition-all",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <div className="relative">
                  <Icon className="w-3 h-3" />
                  {isLive && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Exit */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-[10px] gap-1 px-2 text-white/40 hover:text-white hover:bg-white/5"
        onClick={() => {
          setTVModePreference(false);
          navigate("/");
          window.location.reload();
        }}
      >
        <Monitor className="w-3 h-3" />
        Exit
      </Button>
    </nav>
  );
}
