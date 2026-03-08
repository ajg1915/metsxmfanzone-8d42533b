import { cn } from "@/lib/utils";
import { Radio, Film, RotateCcw, Home, Monitor, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setTVModePreference } from "@/hooks/use-device";
import { useNavigate } from "react-router-dom";
import type { TVCategory } from "@/pages/TVDashboard";
import metsLogo from "@/assets/metsxmfanzone-logo.png";

interface TVNavBarProps {
  activeCategory: TVCategory;
  onCategoryChange: (cat: TVCategory) => void;
}

const navItems: { key: TVCategory; label: string; icon: React.ElementType }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "live", label: "Live", icon: Radio },
  { key: "highlights", label: "Highlights", icon: Film },
  { key: "replays", label: "Replays", icon: RotateCcw },
];

export function TVNavBar({ activeCategory, onCategoryChange }: TVNavBarProps) {
  const navigate = useNavigate();

  return (
    <nav className="h-12 shrink-0 flex items-center justify-between px-6 bg-gradient-to-b from-[hsl(220,20%,8%)] to-[hsl(220,20%,6%)]/95 backdrop-blur-md z-50">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <img src={metsLogo} alt="MetsXMFanZone" className="h-7 w-auto" />
          <span className="text-[13px] font-bold text-white tracking-wide">
            MetsXMFanZone
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10" />

        {/* Nav links — Prime Video style: underline active */}
        <div className="flex items-center gap-1">
          {navItems.map(({ key, label, icon: Icon }) => {
            const active = activeCategory === key;
            const isLive = key === "live";
            return (
              <button
                key={key}
                onClick={() => onCategoryChange(key)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition-all rounded-sm",
                  active
                    ? "text-white"
                    : "text-white/45 hover:text-white/75"
                )}
              >
                <div className="relative">
                  <Icon className="w-3.5 h-3.5" />
                  {isLive && (
                    <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                {label}
                {/* Active underline — Prime style */}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Search + Exit */}
      <div className="flex items-center gap-2">
        <button className="w-7 h-7 flex items-center justify-center rounded-sm text-white/30 hover:text-white/60 transition-colors">
          <Search className="w-3.5 h-3.5" />
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[10px] gap-1 px-2.5 text-white/35 hover:text-white hover:bg-white/5 rounded-sm"
          onClick={() => {
            setTVModePreference(false);
            navigate("/");
            window.location.reload();
          }}
        >
          <Monitor className="w-3 h-3" />
          Exit TV
        </Button>
      </div>
    </nav>
  );
}
