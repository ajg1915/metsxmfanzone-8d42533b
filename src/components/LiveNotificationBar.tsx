import { useState, useEffect } from "react";
import { X, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LiveNotificationBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = sessionStorage.getItem("liveNotificationDismissed");
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("liveNotificationDismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground py-3 px-4 relative animate-in slide-in-from-top duration-500">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Radio className="w-5 h-5 animate-pulse" />
          <p className="text-sm md:text-base font-medium">
            🔴 <span className="font-bold">LIVE NOW:</span> Watch exclusive Mets coverage and analysis!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => navigate("/mlb-network")}
            className="hidden sm:inline-flex"
          >
            Watch Now
          </Button>
          <button
            onClick={handleDismiss}
            className="hover:bg-white/20 rounded p-1 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveNotificationBar;
