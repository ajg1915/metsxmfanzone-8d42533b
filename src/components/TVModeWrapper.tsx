import { useDevice, setTVModePreference } from "@/hooks/use-device";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tv, X, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface TVModeWrapperProps {
  children: React.ReactNode;
}

export function TVModeWrapper({ children }: TVModeWrapperProps) {
  const { isTV } = useDevice();
  const { user, loading: authLoading } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [showTVBar, setShowTVBar] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Only enable TV mode for paid members
  const isTVEligible = isTV && !!user && isPremium;
  const isLoading = authLoading || subLoading;

  // Auto-redirect paid TV users to /tv dashboard (except admin/auth routes)
  useEffect(() => {
    if (isLoading) return;
    
    const isAdminRoute = location.pathname.startsWith("/admin");
    const isAuthRoute = location.pathname === "/auth" || location.pathname === "/logout";
    const isTVRoute = location.pathname === "/tv";
    const isPricingRoute = location.pathname === "/pricing";
    
    if (isTVEligible && !isAdminRoute && !isAuthRoute && !isTVRoute && !isPricingRoute) {
      // Paid member on TV device — redirect to TV dashboard
      navigate("/tv", { replace: true });
    }
  }, [isTVEligible, isLoading, location.pathname, navigate]);

  // Show TV bar only for eligible users
  useEffect(() => {
    if (isTVEligible && !dismissed) {
      setShowTVBar(true);
    } else {
      setShowTVBar(false);
    }
  }, [isTVEligible, dismissed]);

  // Apply TV scaling class only for eligible users
  useEffect(() => {
    const html = document.documentElement;
    if (isTVEligible) {
      html.classList.add("tv-mode");
    } else {
      html.classList.remove("tv-mode");
    }
    return () => html.classList.remove("tv-mode");
  }, [isTVEligible]);

  return (
    <>
      {/* TV Mode top bar — only for paid TV users not on /tv route */}
      {showTVBar && location.pathname !== "/tv" && (
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
