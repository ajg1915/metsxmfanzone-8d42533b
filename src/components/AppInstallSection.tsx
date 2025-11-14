import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Bell, Smartphone, Monitor, Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const AppInstallSection = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.info("App is already installed or installation is not available");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success("App installed successfully!");
    }
  };

  const handleNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error("Notifications not supported in this browser");
      return;
    }

    if (Notification.permission === 'granted') {
      toast.success("Notifications already enabled!");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      toast.success("Notifications enabled!");
      new Notification("MetsXMFanZone", {
        body: "You'll now receive updates about live games and exclusive content!",
        icon: "/logo-192.png"
      });
    } else {
      toast.error("Notification permission denied");
    }
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get the Best Experience
          </h2>
          <p className="text-muted-foreground text-lg">
            Install our app and enable notifications for instant access to live games and updates
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Install App Card */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                {isMobile ? (
                  <Smartphone className="h-6 w-6 text-primary" />
                ) : (
                  <Monitor className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  Install App
                  {isInstalled && <Check className="h-5 w-5 text-green-500" />}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isMobile 
                    ? "Get quick access from your home screen. Works offline!"
                    : "Install on your desktop for instant access and offline support"
                  }
                </p>
                <Button 
                  onClick={handleInstall} 
                  disabled={isInstalled || !deferredPrompt}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isInstalled ? "Already Installed" : "Install Now"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Enable Notifications Card */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  Enable Notifications
                  {notificationsEnabled && <Check className="h-5 w-5 text-green-500" />}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get instant alerts for live games, highlights, and exclusive Mets content
                </p>
                <Button 
                  onClick={handleNotifications}
                  disabled={notificationsEnabled}
                  variant="outline"
                  className="w-full"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {notificationsEnabled ? "Notifications Enabled" : "Enable Notifications"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AppInstallSection;
