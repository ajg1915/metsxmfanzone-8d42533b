import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/metsxmfanzone-logo.png";

const LiveNotificationBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    link_url: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = sessionStorage.getItem("liveNotificationDismissed");
    if (dismissed) {
      setIsVisible(false);
      return;
    }

    const fetchActiveNotification = async () => {
      const { data, error } = await supabase
        .from("live_notifications")
        .select("message, link_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setNotification(data);
        setIsVisible(true);
      }
    };

    fetchActiveNotification();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("liveNotificationDismissed", "true");
  };

  if (!isVisible || !notification) return null;

  return (
    <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground py-3 px-4 relative animate-in slide-in-from-top duration-500">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <img src={logo} alt="MetsXMFanZone" className="w-8 h-8 animate-pulse" />
          <p className="text-sm md:text-base font-medium">
            {notification.message}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => navigate(notification.link_url)}
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
