import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import PremiumBadge from "@/components/PremiumBadge";
import HighlightsSection from "@/components/HighlightsSection";

const GameHighlightsSection = () => {
  const { user } = useAuth();
  const { isPremium, loading } = useSubscription();

  const showProBadge = !loading && (!user || !isPremium);

  return (
    <div className="relative">
      {showProBadge && (
        <div className="absolute top-8 right-8 z-20">
          <PremiumBadge size="md" />
        </div>
      )}
      <HighlightsSection />
    </div>
  );
};

export default GameHighlightsSection;
