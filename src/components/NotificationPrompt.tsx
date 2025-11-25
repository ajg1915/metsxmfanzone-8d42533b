import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";

const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { permission, isSubscribed, requestPermission, unsubscribe } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    // Show prompt if user is authenticated and hasn't granted or denied permission yet
    if (user && permission === "default" && !isSubscribed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [user, permission, isSubscribed]);

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Card className="border-primary shadow-lg">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Stay Updated!</CardTitle>
          </div>
          <CardDescription className="text-sm">
            Get instant notifications when we post news, updates, and announcements about the Mets!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={handleEnable} className="flex-1">
            <Bell className="mr-2 h-4 w-4" />
            Enable Notifications
          </Button>
          <Button variant="outline" onClick={handleDismiss} className="flex-1">
            Maybe Later
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPrompt;
