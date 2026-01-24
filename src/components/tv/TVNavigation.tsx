import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tv, Radio, Video, Podcast, Calendar, Home } from "lucide-react";
import { FocusableCard } from "./FocusableCard";
import { cn } from "@/lib/utils";
import metsLogo from "@/assets/metsxmfanzone-logo.png";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'nav-home', label: 'Home', icon: <Home className="w-8 h-8" />, path: '/tv' },
  { id: 'nav-live', label: 'Live', icon: <Tv className="w-8 h-8" />, path: '/tv/live' },
  { id: 'nav-highlights', label: 'Highlights', icon: <Video className="w-8 h-8" />, path: '/tv/highlights' },
  { id: 'nav-podcasts', label: 'Podcasts', icon: <Podcast className="w-8 h-8" />, path: '/tv/podcasts' },
  { id: 'nav-schedule', label: 'Schedule', icon: <Calendar className="w-8 h-8" />, path: '/tv/schedule' },
];

export function TVNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/30">
      <div className="flex items-center justify-between px-12 py-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img 
            src={metsLogo} 
            alt="MetsXMFanZone" 
            className="h-14 w-auto"
          />
          <span className="text-3xl font-bold text-foreground">
            MetsXM<span className="text-primary">FanZone</span>
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path || 
                           (item.path === '/tv' && location.pathname === '/tv');
            
            return (
              <FocusableCard
                key={item.id}
                id={item.id}
                row={0}
                col={index}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-xl transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted/50 text-foreground hover:bg-muted"
                )}
              >
                {item.icon}
                <span className="text-xl font-medium">{item.label}</span>
              </FocusableCard>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
