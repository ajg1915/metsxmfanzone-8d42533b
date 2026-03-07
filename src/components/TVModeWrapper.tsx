import { useDevice, setTVModePreference } from "@/hooks/use-device";
import { Button } from "@/components/ui/button";
import { Tv, X, Monitor } from "lucide-react";
import { useState, useEffect } from "react";

interface TVModeWrapperProps {
  children: React.ReactNode;
}

export function TVModeWrapper({ children }: TVModeWrapperProps) {
  const { isTV } = useDevice();
  const [showTVBar, setShowTVBar] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show a subtle TV mode indicator when in TV mode
  useEffect(() => {
    if (isTV && !dismissed) {
      setShowTVBar(true);
    } else {
      setShowTVBar(false);
    }
  }, [isTV, dismissed]);

  // Apply TV scaling class to html element
  useEffect(() => {
    const html = document.documentElement;
    if (isTV) {
      html.classList.add("tv-mode");
    } else {
      html.classList.remove("tv-mode");
    }
    return () => html.classList.remove("tv-mode");
  }, [isTV]);

  return (
    <>
      {/* TV Mode top bar */}
      {showTVBar && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-card/95 backdrop-blur border-b border-primary/30 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-primary" />
            <span className="text-xs text-foreground font-medium">TV Mode Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => {
                setTVModePreference(false);
                window.location.reload();
              }}
            >
              <Monitor className="w-3.5 h-3.5" />
              Switch to Desktop
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setDismissed(true)}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
