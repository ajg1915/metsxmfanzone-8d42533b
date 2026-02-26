import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PremiumBadge from "@/components/PremiumBadge";
import HighlightsSection from "@/components/HighlightsSection";

const GameHighlightsSection = () => {
  const { user } = useAuth();
  const { isPremium, loading } = useSubscription();
  const navigate = useNavigate();

  const showProBadge = !loading && (!user || !isPremium);

  // If not logged in, intercept video clicks and redirect to auth
  const handleVideoClick = !user ? () => { navigate("/auth"); return true; } : undefined;

  return (
    <div>
      <HighlightsSection 
        onVideoClick={handleVideoClick} 
        badge={showProBadge ? <PremiumBadge size="sm" noGlow /> : undefined}
      />
    </div>
  );
};

export default GameHighlightsSection;
