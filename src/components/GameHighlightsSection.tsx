import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HighlightsSection from "@/components/HighlightsSection";

const GameHighlightsSection = () => {
  const { user } = useAuth();
  const { isPremium, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) return null;

  // Not logged in or free member — show locked teaser
  if (!user || !isPremium) {
    return (
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="relative rounded-xl overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm p-6 sm:p-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                Mets Game Highlights
              </h2>
              <Badge className="text-[10px] sm:text-xs px-2 py-0.5 font-semibold bg-primary/90 text-primary-foreground">
                PRO
              </Badge>
              <p className="text-sm text-muted-foreground max-w-md">
                Upgrade to a premium membership to watch the latest Mets game highlights, key plays, and top moments.
              </p>
              <Button
                size="sm"
                onClick={() => navigate("/plans")}
                className="mt-2"
              >
                Upgrade to PRO
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Premium member — show full highlights
  return <HighlightsSection />;
};

export default GameHighlightsSection;
