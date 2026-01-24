import React from "react";
import { TVNavigation } from "./TVNavigation";
import { TVNavigationProvider } from "@/hooks/use-tv-navigation";
import { cn } from "@/lib/utils";

interface TVLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function TVLayout({ children, className }: TVLayoutProps) {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <TVNavigationProvider>
      <div className={cn(
        "min-h-screen bg-background tv-mode",
        className
      )}>
        {/* Top bar with time */}
        <div className="fixed top-0 right-0 z-50 p-6">
          <span className="text-2xl font-medium text-foreground/80">
            {formattedTime}
          </span>
        </div>

        {/* Navigation */}
        <TVNavigation />

        {/* Main content */}
        <main className="pt-28 pb-12 px-12">
          {children}
        </main>
      </div>
    </TVNavigationProvider>
  );
}
