import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Bell, Smartphone, Monitor, Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
  }>;
}

const AppInstallSection = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const isMobile = useIsMobile();
  const { permission, isSubscribed, requestPermission } = useNotifications();

  const notificationsEnabled = permission === 'granted' && isSubscribed;

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
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
    
    // Use the hook to properly subscribe to push notifications
    const success = await requestPermission();
    
    if (success) {
      // Show a local notification as confirmation
      new Notification("MetsXMFanZone", {
        body: "You'll now receive updates about live games and exclusive content!",
        icon: "/logo-192.png"
      });
    }
  };

  return (
    <section className="py-10 sm:py-12 md:py-16 px-4 relative overflow-hidden">
      {/* Blue glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, hsl(220 80% 50% / 0.08), transparent 70%)",
        }}
      />
      <div className="container max-w-6xl mx-auto px-0 sm:px-4 relative z-10">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Get the Best Experience
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Install our app and enable notifications for instant access to live games and updates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Install App Card */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                {isMobile ? <Smartphone className="h-6 w-6 text-primary" /> : <Monitor className="h-6 w-6 text-primary" />}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  Install App
                  {isInstalled && <Check className="h-5 w-5 text-green-500" />}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isMobile ? "Get quick access from your home screen. Works offline!" : "Install on your desktop for instant access and offline support"}
                </p>
                <Button onClick={handleInstall} disabled={isInstalled || !deferredPrompt} className="w-full">
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
                <Button onClick={handleNotifications} disabled={notificationsEnabled} variant="outline" className="w-full">
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
