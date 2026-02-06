import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import metsLogo from "@/assets/metsxmfanzone-logo.png";

interface StreamTimeLimitProps {
  children: React.ReactNode;
}

const STREAM_TIME_LIMIT_MS = 10 * 60 * 1000; // 10 minutes for free users
const STORAGE_KEY = "stream_viewing_start";

const StreamTimeLimit = ({ children }: StreamTimeLimitProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userPlan, setUserPlan] = useState<"free" | "premium" | "annual" | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Fetch user's subscription plan
  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if user is admin (admins get annual access automatically)
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleData) {
          setUserPlan("annual");
          setLoading(false);
          return;
        }

        // Check subscription
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("plan_type")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const plan = (subData?.plan_type as "free" | "premium" | "annual") || "free";
        setUserPlan(plan);
        
        // Free users now get a 10-minute preview instead of immediate redirect
      } catch (error) {
        console.error("Error fetching plan:", error);
        setUserPlan("free");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPlan();
    }
  }, [user]);

  // Start/check timer for free users - 10 minute preview
  useEffect(() => {
    if (loading || userPlan !== "free") return;

    // Get or set the start time
    let startTime = sessionStorage.getItem(STORAGE_KEY);
    if (!startTime) {
      startTime = Date.now().toString();
      sessionStorage.setItem(STORAGE_KEY, startTime);
    }

    const checkTimeLimit = () => {
      const elapsed = Date.now() - parseInt(startTime!, 10);
      const remaining = STREAM_TIME_LIMIT_MS - elapsed;
      
      if (remaining <= 0) {
        setShowUpgradePrompt(true);
        setTimeRemaining(0);
      } else {
        setTimeRemaining(Math.ceil(remaining / 1000)); // Convert to seconds
      }
    };

    // Check immediately
    checkTimeLimit();

    // Check every second for accurate countdown
    const interval = setInterval(checkTimeLimit, 1000);

    return () => clearInterval(interval);
  }, [loading, userPlan]);

  const handleUpgrade = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setShowUpgradePrompt(false);
    window.location.href = "/pricing";
  };

  const handleGoHome = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setShowUpgradePrompt(false);
    window.location.href = "/";
  };

  // Show loading state while checking auth/subscription
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <img src={metsLogo} alt="MetsXMFanZone" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render
  if (!user) {
    return null;
  }

  // Format time remaining for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Free users get timed preview
  if (userPlan === "free") {
    return (
      <>
        {!showUpgradePrompt && (
          <>
            {/* Timer overlay for free users */}
            {timeRemaining !== null && timeRemaining > 0 && (
              <div className="fixed top-20 right-4 z-50 bg-background/90 backdrop-blur-sm border border-primary rounded-lg px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    Free Preview: {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            )}
            {children}
          </>
        )}
        
        <AlertDialog open={showUpgradePrompt}>
          <AlertDialogContent className="max-w-md" onEscapeKeyDown={(e) => e.preventDefault()}>
            <AlertDialogHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center">
                <img src={metsLogo} alt="MetsXM" className="w-14 h-14 object-contain" />
              </div>
              <AlertDialogTitle className="text-xl">
                Your Free Preview Has Ended
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center space-y-3">
                <p>
                  Thank you for watching! Your 10-minute free stream preview has ended.
                </p>
                <p>
                  Upgrade to Premium or Annual membership to enjoy unlimited streaming with no time limits.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
              <Button onClick={handleUpgrade} className="w-full gap-2">
                <img src={metsLogo} alt="MetsXM" className="w-4 h-4 object-contain" />
                Select a Plan
              </Button>
              <Button variant="outline" onClick={handleGoHome} className="w-full">
                Return Home
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Premium and annual users get unlimited access
  return <>{children}</>;
};

export default StreamTimeLimit;
