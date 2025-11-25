import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const WebAppInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
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
      setDeferredPrompt(null);
      setShowPrompt(false);
      toast.success("App installed successfully!");
    }
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-4xl mx-auto">
        <Card className="p-8 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="p-4 rounded-full bg-primary/10">
              <Download className="h-8 w-8 text-primary" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-3">Install Our Web App</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Get instant access to live Mets games, highlights, and exclusive content directly from your home screen
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleInstall} size="lg" className="text-lg px-8">
                <Download className="h-5 w-5 mr-2" />
                Install Now
              </Button>
              <Button
                onClick={() => setShowPrompt(false)}
                size="lg"
                variant="ghost"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default WebAppInstall;
