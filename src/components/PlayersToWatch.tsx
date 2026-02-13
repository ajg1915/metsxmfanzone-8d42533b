import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Snowflake, TrendingUp, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import metsLogo from "@/assets/metsxmfanzone-logo.png";

interface PlayerPrediction {
  id: string;
  player_name: string;
  player_id: number | null;
  player_image_url: string | null;
  status: "hot" | "cold";
  description: string;
  prediction_date: string;
  is_pitcher: boolean | null;
  predicted_hr: number | null;
  predicted_rbis: number | null;
  predicted_runs: number | null;
  predicted_sb: number | null;
  predicted_strikeouts: number | null;
  predicted_innings_pitched: number | null;
  predicted_saves: number | null;
  predicted_win_loss: string | null;
  predicted_walks: number | null;
  predicted_walks_allowed: number | null;
  predicted_hr_allowed: number | null;
  confidence: number | null;
}

const PlayersToWatch = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: predictions, isLoading, refetch } = useQuery({
    queryKey: ["daily-player-predictions"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("daily_player_predictions")
        .select("*")
        .eq("prediction_date", today)
        .order("created_at", { ascending: true })
        .limit(6);
      if (error) throw error;
      return data as PlayerPrediction[];
    },
  });

  const generatePredictions = async () => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke("generate-daily-predictions");
      if (response.error) throw new Error(response.error.message);
      toast.success("Daily predictions generated!");
      refetch();
    } catch (error) {
      console.error("Error generating predictions:", error);
      toast.error("Failed to generate predictions");
    } finally {
      setIsGenerating(false);
    }
  };

  const shouldGenerate = !isLoading && (!predictions || predictions.length === 0);

  const isPitcherPlayer = (p: PlayerPrediction) => p.is_pitcher === true;
  const isCloser = (p: PlayerPrediction) => (p.predicted_saves ?? 0) > 0;
  const isStarter = (p: PlayerPrediction) => isPitcherPlayer(p) && !isCloser(p);

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden w-full box-border">
      <div className="w-full max-w-full mx-auto">
        <GlassCard glow="blue" className="p-4 sm:p-6 md:p-8 lg:p-10 w-full max-w-full border-2 border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={metsLogo} alt="MetsXMFanZone" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
              <div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">
                  Anthony's Predictions
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Daily parlay picks & stat projections
                </p>
              </div>
            </div>
            {predictions && predictions.length > 0 && (
              <div className="text-[10px] sm:text-xs text-muted-foreground bg-card/50 px-2 sm:px-3 py-1 rounded-full w-fit">
                Updated: {new Date().toLocaleDateString()}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-3 text-foreground">Loading predictions...</span>
            </div>
          )}

          {shouldGenerate && (
            <div className="flex flex-col items-center justify-center py-12 bg-card/30 rounded-xl border border-border/50">
              <TrendingUp className="w-12 h-12 text-primary mb-4" />
              <p className="text-foreground mb-4 text-center">Predictions not yet available</p>
              <Button onClick={generatePredictions} disabled={isGenerating} className="bg-primary hover:bg-primary/90">
                {isGenerating ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><TrendingUp className="w-4 h-4 mr-2" />Predictions Coming Soon</>
                )}
              </Button>
            </div>
          )}

          {predictions && predictions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.map((player) => (
                <ParlayCard key={player.id} player={player} isPitcher={isPitcherPlayer(player)} isCloser={isCloser(player)} isStarter={isStarter(player)} />
              ))}
            </div>
          )}

          {predictions && predictions.length > 0 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-xs text-primary font-semibold">Anthony Approved</span>
              <span className="text-xs text-muted-foreground ml-2">🎲 For entertainment purposes. Always bet responsibly.</span>
            </div>
          )}
        </GlassCard>
      </div>
    </section>
  );
};

// Individual Parlay Card Component
const ParlayCard = ({ player, isPitcher, isCloser, isStarter }: { 
  player: PlayerPrediction; 
  isPitcher: boolean;
  isCloser: boolean;
  isStarter: boolean;
}) => {
  const roleLabel = isCloser ? "CLOSER" : isStarter ? "STARTER" : "HITTER";
  
  return (
    <div className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${
      player.status === "hot" 
        ? "border-orange-500/50 hover:border-orange-500 shadow-orange-500/10" 
        : "border-blue-500/50 hover:border-blue-500 shadow-blue-500/10"
    } bg-gradient-to-br from-background/95 to-card/80`}>
      
      {/* Player Header */}
      <div className={`px-4 py-3 flex items-center gap-3 ${
        player.status === "hot" 
          ? "bg-gradient-to-r from-orange-600/20 to-orange-500/10" 
          : "bg-gradient-to-r from-blue-600/20 to-blue-500/10"
      }`}>
        <div className="relative flex-shrink-0">
          <img
            src={player.player_image_url || "/placeholder.svg"}
            alt={player.player_name}
            className="w-14 h-14 rounded-xl object-cover border-2 border-primary/30"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            player.status === "hot" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
          }`}>
            {player.status === "hot" ? "🔥" : "❄️"}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-sm sm:text-base truncate">{player.player_name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
              player.status === "hot" ? "border-orange-500/50 text-orange-400" : "border-blue-500/50 text-blue-400"
            }`}>
              {player.status === "hot" ? "HOT" : "COLD"}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
              {roleLabel}
            </Badge>
          </div>
        </div>
        {/* W/L graphic for starters */}
        {isStarter && player.predicted_win_loss && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black ${
            player.predicted_win_loss === "W" 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}>
            {player.predicted_win_loss}
          </div>
        )}
      </div>

      {/* Stat Line */}
      <div className="px-4 py-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">
          Today's Projected Line
        </div>
        
        {isPitcher ? (
          <div className="grid grid-cols-4 gap-1.5">
            {isCloser ? (
              <>
                <StatBox label="SV" value={player.predicted_saves ?? 0} highlight />
                <StatBox label="K" value={player.predicted_strikeouts ?? 0} />
                <StatBox label="IP" value={player.predicted_innings_pitched ?? 0} />
                <StatBox label="BB" value={player.predicted_walks_allowed ?? 0} />
              </>
            ) : (
              <>
                <StatBox label="K" value={player.predicted_strikeouts ?? 0} highlight />
                <StatBox label="IP" value={player.predicted_innings_pitched ?? 0} />
                <StatBox label="BB" value={player.predicted_walks_allowed ?? 0} />
                <StatBox label="HR" value={player.predicted_hr_allowed ?? 0} />
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5">
            <StatBox label="HR" value={player.predicted_hr ?? 0} highlight />
            <StatBox label="RBI" value={player.predicted_rbis ?? 0} />
            <StatBox label="R" value={player.predicted_runs ?? 0} />
            <StatBox label="SB" value={player.predicted_sb ?? 0} />
          </div>
        )}
      </div>

      {/* Description / Betting Tip */}
      <div className="px-4 pb-3">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic">
          "{player.description}"
        </p>
      </div>

      {/* Confidence Bar */}
      {player.confidence != null && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Confidence</span>
            <span className="font-bold text-primary">{player.confidence}%</span>
          </div>
          <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                player.status === "hot" 
                  ? "bg-gradient-to-r from-orange-600 to-orange-400" 
                  : "bg-gradient-to-r from-blue-600 to-blue-400"
              }`}
              style={{ width: `${player.confidence}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className={`h-1 w-full ${
        player.status === "hot"
          ? "bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500"
          : "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400"
      }`} />
    </div>
  );
};

const StatBox = ({ label, value, highlight = false }: { label: string; value: number | string; highlight?: boolean }) => (
  <div className={`rounded-lg p-2 text-center ${highlight ? "bg-primary/15 border border-primary/30" : "bg-background/40 border border-border/30"}`}>
    <div className={`text-base sm:text-lg font-black ${highlight ? "text-primary" : "text-foreground"}`}>
      {value}
    </div>
    <div className="text-[10px] text-muted-foreground font-medium">{label}</div>
  </div>
);

export default PlayersToWatch;
