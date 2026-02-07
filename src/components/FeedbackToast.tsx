import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { MessageSquareHeart } from "lucide-react";
import logoIcon from "@/assets/metsxmfanzone-logo.png";

const FEEDBACK_TOAST_KEY = "metsxm_feedback_toast_last_shown";
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const FeedbackToast = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Only show for authenticated users
    if (!user || hasShown) return;

    // Check if we've shown the toast in the last 24 hours
    const lastShown = localStorage.getItem(FEEDBACK_TOAST_KEY);
    const now = Date.now();

    if (lastShown) {
      const lastShownTime = parseInt(lastShown, 10);
      if (now - lastShownTime < ONE_DAY_MS) {
        // Already shown today, skip
        return;
      }
    }

    // Delay showing the toast to not overwhelm on page load
    const timer = setTimeout(() => {
      localStorage.setItem(FEEDBACK_TOAST_KEY, now.toString());
      setHasShown(true);

      toast({
        duration: 8000,
        className: "bg-card border-primary/30",
        description: (
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="MetsXMFanZone" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <p className="font-semibold text-foreground flex items-center gap-2">
                <MessageSquareHeart className="w-4 h-4 text-primary" />
                We'd love your feedback!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Help us improve MetsXMFanZone
              </p>
            </div>
            <button
              onClick={() => navigate("/feedback")}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Share
            </button>
          </div>
        ),
      });
    }, 10000); // Show after 10 seconds on the page

    return () => clearTimeout(timer);
  }, [user, hasShown, navigate]);

  return null;
};

export default FeedbackToast;
