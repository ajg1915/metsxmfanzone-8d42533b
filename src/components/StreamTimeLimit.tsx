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

const STREAM_TIME_LIMIT_MS = 20 * 60 * 1000; // 20 minutes
const STORAGE_KEY = "stream_viewing_start";

const StreamTimeLimit = ({ children }: StreamTimeLimitProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userPlan, setUserPlan] = useState<"free" | "premium" | "annual" | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [loading, setLoading] = useState(true);

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

        setUserPlan((subData?.plan_type as "free" | "premium" | "annual") || "free");
      } catch (error) {
        console.error("Error fetching plan:", error);
        setUserPlan("free");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [user]);

  // Start/check timer for free users
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
      if (elapsed >= STREAM_TIME_LIMIT_MS) {
        setShowUpgradePrompt(true);
      }
    };

    // Check immediately
    checkTimeLimit();

    // Check every 10 seconds
    const interval = setInterval(checkTimeLimit, 10000);

    return () => clearInterval(interval);
  }, [loading, userPlan]);

  const handleUpgrade = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setShowUpgradePrompt(false);
    window.location.href = "/plans";
  };

  const handleGoHome = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setShowUpgradePrompt(false);
    window.location.href = "/";
  };

  if (loading) {
    return <>{children}</>;
  }

  // Premium and annual users get unlimited access
  if (userPlan !== "free") {
    return <>{children}</>;
  }

  return (
    <>
      {!showUpgradePrompt && children}
      
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
                Thank you for watching! Your 20-minute free stream preview has ended.
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
};

export default StreamTimeLimit;
