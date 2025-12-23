import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const REMEMBER_ME_KEY = "metsxm_remember_user";
const WARNING_THRESHOLD_HOURS = 4; // Warn 4 hours before expiry
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

interface RememberedUser {
  email: string;
  expiresAt: number;
}

export const useSessionExpiryWarning = () => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const { toast } = useToast();

  const checkSessionExpiry = useCallback(() => {
    try {
      const storedData = localStorage.getItem(REMEMBER_ME_KEY);
      if (!storedData) {
        setTimeRemaining(null);
        setShowWarning(false);
        return;
      }

      const rememberedUser: RememberedUser = JSON.parse(storedData);
      const now = Date.now();
      const remaining = rememberedUser.expiresAt - now;

      if (remaining <= 0) {
        // Session has expired
        localStorage.removeItem(REMEMBER_ME_KEY);
        setTimeRemaining(null);
        setShowWarning(false);
        toast({
          title: "Session Expired",
          description: "Your remember me session has expired. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      setTimeRemaining(remaining);

      // Show warning if less than threshold remaining
      const warningThreshold = WARNING_THRESHOLD_HOURS * 60 * 60 * 1000;
      if (remaining <= warningThreshold && !showWarning) {
        setShowWarning(true);
        const hoursLeft = Math.ceil(remaining / (60 * 60 * 1000));
        const minutesLeft = Math.ceil(remaining / (60 * 1000));
        
        const timeMessage = hoursLeft >= 1 
          ? `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}`
          : `${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`;

        toast({
          title: "Session Expiring Soon",
          description: `Your session will expire in ${timeMessage}. Log in again to stay remembered.`,
          duration: 10000,
        });
      }
    } catch (error) {
      console.error("Error checking session expiry:", error);
    }
  }, [showWarning, toast]);

  useEffect(() => {
    // Initial check
    checkSessionExpiry();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkSessionExpiry, CHECK_INTERVAL_MS);

    // Also check when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSessionExpiry();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkSessionExpiry]);

  const formatTimeRemaining = useCallback(() => {
    if (timeRemaining === null) return null;
    
    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [timeRemaining]);

  const extendSession = useCallback(() => {
    // This would require re-login, so we just notify the user
    toast({
      title: "Extend Session",
      description: "Please log in again to extend your session.",
    });
  }, [toast]);

  return {
    timeRemaining,
    showWarning,
    formatTimeRemaining,
    extendSession,
    hasActiveSession: timeRemaining !== null && timeRemaining > 0,
  };
};
