import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Snowflake, TrendingUp, RefreshCw, Target, Trophy, XCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import GlassCard from "@/components/GlassCard";

interface PlayerPrediction {
  id: string;
  player_name: string;
  player_id: number | null;
  player_image_url: string | null;
  status: "hot" | "cold";
  description: string;
  prediction_date: string;
  is_pitcher: boolean;
  predicted_hr: number;
  predicted_walks: number;
  predicted_sb: number;
  predicted_rbis: number;
  predicted_runs: number;
  predicted_strikeouts: number;
  predicted_innings_pitched: number;
  predicted_hr_allowed: number;
  predicted_walks_allowed: number;
  predicted_saves: number;
  predicted_win_loss: string | null;
  confidence: number;
}

const PlayersToWatch = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const { data: predictions, isLoading, refetch } = useQuery({
    queryKey: ["daily-player-predictions"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("daily_player_predictions")
        .select("*")
        .eq("prediction_date", today)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as unknown as PlayerPrediction[];
    },
  });

  const generatePredictions = async () => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke("generate-daily-predictions");
      if (response.error) throw new Error(response.error.message);
      toast.success("Daily parlay predictions generated!");
      refetch();
    } catch (error) {
      console.error("Error generating predictions:", error);
      toast.error("Failed to generate predictions");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFlip = (playerId: string) => {
    setFlippedCards(prev => ({ ...prev, [playerId]: !prev[playerId] }));
  };

  const shouldGenerate = !isLoading && (!predictions || predictions.length === 0);

  const isReliefPitcher = (player: PlayerPrediction) => {
    return player.is_pitcher && (player.predicted_saves > 0 || player.predicted_win_loss === null);
  };

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden w-full box-border">
      <div className="w-full max-w-full mx-auto">
        <GlassCard glow="blue" className="p-4 sm:p-6 md:p-8 lg:p-10 w-full max-w-full">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
                  Anthony's Player Parlays
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Daily stat predictions for your parlays
                </p>
              </div>
            </div>
            {predictions && predictions.length > 0 && (
              <div className="text-[10px] sm:text-xs text-muted-foreground bg-card/50 px-2 sm:px-3 py-1 rounded-full w-fit">
                Updated: {new Date().toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-3 text-white">Loading parlay picks...</span>
            </div>
          )}

          {/* No Predictions */}
          {shouldGenerate && (
            <div className="flex flex-col items-center justify-center py-12 bg-card/30 rounded-xl border border-border/50">
              <Target className="w-12 h-12 text-primary mb-4" />
              <p className="text-white mb-4 text-center">Parlay predictions not yet available</p>
              <Button onClick={generatePredictions} disabled={isGenerating} className="bg-primary hover:bg-primary/90">
                {isGenerating ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Target className="w-4 h-4 mr-2" />Predictions Coming Soon</>
                )}
              </Button>
            </div>
          )}

          {/* Player Parlay Cards Grid */}
          {predictions && predictions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-3 md:gap-4">
              {predictions.map((player) => {
                const isFlipped = flippedCards[player.id];
                const isRP = isReliefPitcher(player);

                return (
                  <div
                    key={player.id}
                    className="perspective-1000 cursor-pointer"
                    onClick={() => toggleFlip(player.id)}
                    onMouseEnter={() => setFlippedCards(prev => ({ ...prev, [player.id]: true }))}
                    onMouseLeave={() => setFlippedCards(prev => ({ ...prev, [player.id]: false }))}
                  >
                    <div
                      className="relative w-full transition-transform duration-500"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                    >
                      {/* Front of Card */}
                      <div
                        className={`relative bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${
                          player.status === "hot"
                            ? "border-orange-500 shadow-orange-500/20"
                            : "border-blue-500 shadow-blue-500/20"
                        }`}
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        {/* Status Badge */}
                        <div
                          className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
                            player.status === "hot"
                              ? "bg-orange-500/90 text-white"
                              : "bg-blue-500/90 text-white"
                          }`}
                        >
                          {player.status === "hot" ? (
                            <><Flame className="w-4 h-4" />HOT</>
                          ) : (
                            <><Snowflake className="w-4 h-4" />COLD</>
                          )}
                        </div>

                        {/* Confidence Badge */}
                        <div className="absolute top-3 left-3 z-10 bg-primary/90 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {player.confidence}%
                        </div>

                        {/* W/L or SV Badge for Pitchers */}
                        {player.is_pitcher && player.predicted_win_loss && (
                          <div className={`absolute top-12 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                            player.predicted_win_loss === "W" 
                              ? "bg-green-500/90 text-white" 
                              : "bg-red-500/90 text-white"
                          }`}>
                            {player.predicted_win_loss === "W" ? (
                              <><Trophy className="w-3 h-3" />WIN</>
                            ) : (
                              <><XCircle className="w-3 h-3" />LOSS</>
                            )}
                          </div>
                        )}
                        {player.is_pitcher && isRP && player.predicted_saves > 0 && (
                          <div className="absolute top-12 left-3 z-10 flex items-center gap-1 bg-yellow-500/90 text-white px-2 py-1 rounded-full text-xs font-bold">
                            <Shield className="w-3 h-3" />SV
                          </div>
                        )}

                        {/* Player Image */}
                        <div className="relative h-48 sm:h-44 bg-gradient-to-b from-background to-card overflow-hidden flex items-center justify-center">
                          {player.player_image_url ? (
                            <img
                              src={player.player_image_url}
                              alt={player.player_name}
                              className="w-full h-full object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-3xl sm:text-2xl font-bold text-primary">
                                  {player.player_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                        </div>

                        {/* Player Info + Parlay Stats */}
                        <div className="p-4 sm:p-3 md:p-4">
                          <h3 className="font-bold text-white text-base sm:text-sm md:text-base mb-2">
                            {player.player_name}
                          </h3>

                          {/* Parlay Stat Predictions */}
                          {player.is_pitcher ? (
                            <div className="grid grid-cols-3 gap-1.5 mb-2">
                              <div className="bg-background/60 rounded-lg p-1.5 text-center">
                                <div className="text-lg font-bold text-primary">{player.predicted_strikeouts}</div>
                                <div className="text-[10px] text-muted-foreground">K's</div>
                              </div>
                              <div className="bg-background/60 rounded-lg p-1.5 text-center">
                                <div className="text-lg font-bold text-white">{player.predicted_innings_pitched}</div>
                                <div className="text-[10px] text-muted-foreground">IP</div>
                              </div>
                              <div className="bg-background/60 rounded-lg p-1.5 text-center">
                                <div className="text-lg font-bold text-yellow-400">{player.predicted_walks_allowed}</div>
                                <div className="text-[10px] text-muted-foreground">BB</div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-4 gap-1 mb-2">
                              <div className="bg-background/60 rounded-lg p-1.5 text-center">
                                <div className="text-lg font-bold text-primary">{player.predicted_hr}</div>
                                <div className="text-[10px] text-muted-foreground">HR</div>
                              </div>
                              <div className="bg-background/60 rounded-lg p-1.5 text-center">
                                <div className="text-lg font-bold text-white">{player.predicted_walks}</div>
                                <div className="text-[10px] text-muted-foreground">BB</div>
                              </div>
                              <div className="bg-background/60 rounded-lg p-1.5 text-center">
                                <div className="text-lg font-bold text-green-400">{player.predicted_rbis}</div>
                                <div className="text-[10px] text-muted-foreground">RBI</div>
                              </div>
                              <div className="bg-background/60 rounded-lg p-1.5 text-center">
                                <div className="text-lg font-bold text-cyan-400">{player.predicted_runs}</div>
                                <div className="text-[10px] text-muted-foreground">R</div>
                              </div>
                            </div>
                          )}

                          <p className="text-sm sm:text-xs text-primary mt-1 font-medium">
                            Tap for parlay tip →
                          </p>
                        </div>

                        {/* Status Bar */}
                        <div
                          className={`h-1.5 sm:h-1 w-full ${
                            player.status === "hot"
                              ? "bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500"
                              : "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400"
                          }`}
                        />
                      </div>

                      {/* Back of Card - Parlay Tip */}
                      <div
                        className={`absolute inset-0 bg-card/95 backdrop-blur-sm rounded-xl overflow-hidden border-2 ${
                          player.status === "hot" ? "border-orange-500" : "border-blue-500"
                        }`}
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <div className="p-4 h-full flex flex-col">
                          <h3 className="font-bold text-white text-sm sm:text-base mb-2 text-center">
                            {player.player_name}
                          </h3>

                          <div className="text-xs text-primary text-center mb-2 font-semibold">
                            🎯 Anthony's Parlay Tip
                          </div>

                          <p className="text-sm text-muted-foreground leading-relaxed flex-1 overflow-auto">
                            {player.description}
                          </p>

                          {/* Confidence bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Confidence</span>
                              <span className="text-primary font-bold">{player.confidence}%</span>
                            </div>
                            <div className="w-full bg-background/50 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  player.confidence >= 70 ? "bg-green-500" : player.confidence >= 40 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${player.confidence}%` }}
                              />
                            </div>
                          </div>

                          {/* Status indicator */}
                          <div
                            className={`mt-3 py-1 px-2 rounded-full text-xs font-bold text-center ${
                              player.status === "hot"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {player.status === "hot" ? "🔥 HOT" : "❄️ COLD"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {predictions && predictions.length > 0 && (
            <p className="text-center text-xs text-muted-foreground mt-6">
              🎲 Parlay predictions for entertainment purposes. Always bet responsibly.
            </p>
          )}
        </GlassCard>
      </div>
    </section>
  );
};

export default PlayersToWatch;
