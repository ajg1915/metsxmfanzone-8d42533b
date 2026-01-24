import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone, Monitor, Tv, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay for better UX
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleLearnMore = () => {
    setShowPrompt(false);
    navigate("/install");
  };

  if (isInstalled || (!showPrompt && !deferredPrompt)) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-[380px]"
        >
          <Card className="p-5 shadow-2xl border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-xl overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            
            <div className="relative">
              {/* Close button */}
              <Button
                onClick={() => setShowPrompt(false)}
                size="icon"
                variant="ghost"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Icon and Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 pr-6">
                  <h3 className="font-bold text-base mb-1">Install MetsXMFanZone</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Get the full app experience with offline access and push notifications
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-primary" />
                  <span>Mobile</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Monitor className="h-3.5 w-3.5 text-primary" />
                  <span>Desktop</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tv className="h-3.5 w-3.5 text-primary" />
                  <span>Smart TV</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {deferredPrompt ? (
                  <Button 
                    onClick={handleInstall} 
                    className="flex-1 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    <Download className="h-4 w-4" />
                    Install Now
                  </Button>
                ) : (
                  <Button 
                    onClick={handleLearnMore}
                    className="flex-1 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    How to Install
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  onClick={handleLearnMore}
                  variant="outline"
                  className="gap-1 text-xs"
                >
                  All Devices
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
