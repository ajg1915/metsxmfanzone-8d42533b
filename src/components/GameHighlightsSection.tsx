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
    <div className="relative">
      {showProBadge && (
        <div className="absolute top-8 right-8 z-20">
          <PremiumBadge size="md" />
        </div>
      )}
      <HighlightsSection onVideoClick={handleVideoClick} />
    </div>
  );
};

export default GameHighlightsSection;
