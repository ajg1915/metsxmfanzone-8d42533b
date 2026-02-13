import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Snowflake, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import GlassCard from "@/components/GlassCard";

interface PlayerPrediction {
  id: string;
  player_name: string;
  player_id: number | null;
  player_image_url: string | null;
  status: "hot" | "cold";
  description: string;
  prediction_date: string;
}

interface PlayerStats {
  avg?: string;
  hr?: number;
  rbi?: number;
  ops?: string;
  era?: string;
  wins?: number;
  losses?: number;
  strikeouts?: number;
  whip?: string;
  isPitcher?: boolean;
  position?: string;
}

interface PositionPlayer {
  name: string;
  position: string;
  status: "hot" | "cold";
  imageUrl: string | null;
}

const PlayersToWatch = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [playerStats, setPlayerStats] = useState<Record<number, PlayerStats>>({});
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [depthChart, setDepthChart] = useState<Record<string, PositionPlayer>>({});

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
      return data as PlayerPrediction[];
    },
  });

  // Fetch player stats and positions from MLB API
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!predictions || predictions.length === 0) return;

      const statsMap: Record<number, PlayerStats> = {};
      const newDepthChart: Record<string, PositionPlayer> = {};
      const currentYear = new Date().getFullYear();

      for (const player of predictions) {
        if (!player.player_id) continue;

        try {
          // Fetch player info including position
          const [statsResponse, infoResponse] = await Promise.all([
            fetch(`https://statsapi.mlb.com/api/v1/people/${player.player_id}/stats?stats=season&season=${currentYear}&group=hitting,pitching`),
            fetch(`https://statsapi.mlb.com/api/v1/people/${player.player_id}`)
          ]);
          
          let position = "UTIL";
          
          if (infoResponse.ok) {
            const infoData = await infoResponse.json();
            const playerInfo = infoData.people?.[0];
            position = playerInfo?.primaryPosition?.abbreviation || "UTIL";
          }
          
          if (statsResponse.ok) {
            const data = await statsResponse.json();
            const stats = data.stats || [];
            
            // Check if pitcher or hitter
            const hittingStats = stats.find((s: any) => s.group?.displayName === "hitting")?.splits?.[0]?.stat;
            const pitchingStats = stats.find((s: any) => s.group?.displayName === "pitching")?.splits?.[0]?.stat;

            if (pitchingStats && pitchingStats.inningsPitched) {
              statsMap[player.player_id] = {
                isPitcher: true,
                era: pitchingStats.era || "0.00",
                wins: pitchingStats.wins || 0,
                losses: pitchingStats.losses || 0,
                strikeouts: pitchingStats.strikeOuts || 0,
                whip: pitchingStats.whip || "0.00",
                position,
              };
            } else if (hittingStats) {
              statsMap[player.player_id] = {
                isPitcher: false,
                avg: hittingStats.avg || ".000",
                hr: hittingStats.homeRuns || 0,
                rbi: hittingStats.rbi || 0,
                ops: hittingStats.ops || ".000",
                position,
              };
            } else {
              // No stats yet (spring training)
              statsMap[player.player_id] = {
                isPitcher: false,
                avg: ".---",
                hr: 0,
                rbi: 0,
                ops: ".---",
                position,
              };
            }
          }
          
          // Map position to depth chart slot
          const positionMap: Record<string, string> = {
            "P": "P", "SP": "P", "RP": "P",
            "C": "C",
            "1B": "1B",
            "2B": "2B",
            "3B": "3B",
            "SS": "SS",
            "LF": "LF",
            "CF": "CF",
            "RF": "RF",
            "OF": "CF", // Default outfielders to CF if not specific
            "DH": "DH",
            "UTIL": "DH"
          };
          
          const mappedPosition = positionMap[position] || "DH";
          
          // Only add if position not already filled (first player gets priority)
          if (!newDepthChart[mappedPosition]) {
            newDepthChart[mappedPosition] = {
              name: player.player_name.split(" ").pop() || player.player_name, // Last name only
              position: mappedPosition,
              status: player.status,
              imageUrl: player.player_image_url
            };
          }
        } catch (error) {
          console.error(`Failed to fetch data for player ${player.player_id}:`, error);
        }
      }

      setPlayerStats(statsMap);
      setDepthChart(newDepthChart);
    };

    fetchPlayerData();
  }, [predictions]);

  const generatePredictions = async () => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke("generate-daily-predictions");
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast.success("Daily predictions generated!");
      refetch();
    } catch (error) {
      console.error("Error generating predictions:", error);
      toast.error("Failed to generate predictions");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFlip = (playerId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }));
  };

  // If no predictions for today, try to generate them
  const shouldGenerate = !isLoading && (!predictions || predictions.length === 0);

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden w-full box-border">
      <div className="w-full max-w-full mx-auto">
        <GlassCard glow="blue" className="p-4 sm:p-6 md:p-8 lg:p-10 w-full max-w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary flex-shrink-0" />
            <div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
                Anthony's Predictions
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Betting tips updated daily
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
            <span className="ml-3 text-white">Loading predictions...</span>
          </div>
        )}

        {/* No Predictions - Generate Button */}
        {shouldGenerate && (
          <div className="flex flex-col items-center justify-center py-12 bg-card/30 rounded-xl border border-border/50">
            <TrendingUp className="w-12 h-12 text-primary mb-4" />
            <p className="text-white mb-4 text-center">
              Predictions not yet available
            </p>
            <Button 
              onClick={generatePredictions} 
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Predictions Coming Soon
                </>
              )}
            </Button>
          </div>
        )}

        {/* Player Cards Grid */}
        {predictions && predictions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-3 md:gap-4">
            {predictions.map((player) => {
              const stats = player.player_id ? playerStats[player.player_id] : null;
              const isFlipped = flippedCards[player.id];
              
              return (
                <div
                  key={player.id}
                  className="perspective-1000 cursor-pointer"
                  onClick={() => toggleFlip(player.id)}
                  onMouseEnter={() => setFlippedCards(prev => ({ ...prev, [player.id]: true }))}
                  onMouseLeave={() => setFlippedCards(prev => ({ ...prev, [player.id]: false }))}
                >
                  <div
                    className={`relative w-full transition-transform duration-500 transform-style-3d ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
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
                          <>
                            <Flame className="w-4 h-4" />
                            HOT
                          </>
                        ) : (
                          <>
                            <Snowflake className="w-4 h-4" />
                            COLD
                          </>
                        )}
                      </div>

                      {/* Player Image */}
                      <div className="relative h-48 sm:h-44 bg-gradient-to-b from-background to-card overflow-hidden flex items-center justify-center">
                        {player.player_image_url ? (
                          <img
                            src={player.player_image_url}
                            alt={player.player_name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
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
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                      </div>

                      {/* Player Info */}
                      <div className="p-4 sm:p-3 md:p-4">
                        <h3 className="font-bold text-white text-base sm:text-sm md:text-base mb-2 sm:mb-2">
                          {player.player_name}
                        </h3>
                        <p className="text-sm sm:text-xs text-muted-foreground leading-relaxed">
                          {player.description}
                        </p>
                        <p className="text-sm sm:text-xs text-primary mt-3 sm:mt-2 font-medium">
                          Tap for stats →
                        </p>
                      </div>

                      {/* Hot/Cold Indicator Bar */}
                      <div
                        className={`h-1.5 sm:h-1 w-full ${
                          player.status === "hot"
                            ? "bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500"
                            : "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400"
                        }`}
                      />
                    </div>

                    {/* Back of Card - Stats */}
                    <div
                      className={`absolute inset-0 bg-card/95 backdrop-blur-sm rounded-xl overflow-hidden border-2 ${
                        player.status === "hot" 
                          ? "border-orange-500" 
                          : "border-blue-500"
                      }`}
                      style={{ 
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <div className="p-4 h-full flex flex-col">
                        <h3 className="font-bold text-white text-sm sm:text-base mb-3 text-center">
                          {player.player_name}
                        </h3>
                        
                        <div className="text-xs text-muted-foreground text-center mb-3">
                          {new Date().getFullYear()} Season Stats
                        </div>

                        {stats ? (
                          <div className="flex-1 flex flex-col justify-center">
                            {stats.isPitcher ? (
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-background/50 rounded-lg p-2 text-center">
                                  <div className="text-lg font-bold text-primary">{stats.era}</div>
                                  <div className="text-xs text-muted-foreground">ERA</div>
                                </div>
                                <div className="bg-background/50 rounded-lg p-2 text-center">
                                  <div className="text-lg font-bold text-white">{stats.wins}-{stats.losses}</div>
                                  <div className="text-xs text-muted-foreground">W-L</div>
                                </div>
                                <div className="bg-background/50 rounded-lg p-2 text-center">
                                  <div className="text-lg font-bold text-white">{stats.strikeouts}</div>
                                  <div className="text-xs text-muted-foreground">K</div>
                                </div>
                                <div className="bg-background/50 rounded-lg p-2 text-center">
                                  <div className="text-lg font-bold text-white">{stats.whip}</div>
                                  <div className="text-xs text-muted-foreground">WHIP</div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-background/50 rounded-lg p-2 text-center">
                                  <div className="text-lg font-bold text-primary">{stats.avg}</div>
                                  <div className="text-xs text-muted-foreground">AVG</div>
                                </div>
                                <div className="bg-background/50 rounded-lg p-2 text-center">
                                  <div className="text-lg font-bold text-white">{stats.hr}</div>
                                  <div className="text-xs text-muted-foreground">HR</div>
                                </div>
                                <div className="bg-background/50 rounded-lg p-2 text-center">
                                  <div className="text-lg font-bold text-white">{stats.rbi}</div>
                                  <div className="text-xs text-muted-foreground">RBI</div>
                                </div>
                                <div className="bg-background/50 rounded-lg p-2 text-center">
                                  <div className="text-lg font-bold text-white">{stats.ops}</div>
                                  <div className="text-xs text-muted-foreground">OPS</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
                          </div>
                        )}

                        {/* Status indicator on back */}
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
            🎲 Predictions for entertainment purposes. Always bet responsibly.
          </p>
        )}
        </GlassCard>
      </div>
    </section>
  );
};

export default PlayersToWatch;
