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
}

const PlayersToWatch = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [playerStats, setPlayerStats] = useState<Record<number, PlayerStats>>({});
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
      return data as PlayerPrediction[];
    },
  });

  // Fetch player stats from MLB API
  useEffect(() => {
    const fetchPlayerStats = async () => {
      if (!predictions || predictions.length === 0) return;

      const statsMap: Record<number, PlayerStats> = {};
      const currentYear = new Date().getFullYear();

      for (const player of predictions) {
        if (!player.player_id) continue;

        try {
          // Fetch player stats from MLB API
          const response = await fetch(
            `https://statsapi.mlb.com/api/v1/people/${player.player_id}/stats?stats=season&season=${currentYear}&group=hitting,pitching`
          );
          
          if (response.ok) {
            const data = await response.json();
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
              };
            } else if (hittingStats) {
              statsMap[player.player_id] = {
                isPitcher: false,
                avg: hittingStats.avg || ".000",
                hr: hittingStats.homeRuns || 0,
                rbi: hittingStats.rbi || 0,
                ops: hittingStats.ops || ".000",
              };
            } else {
              // No stats yet (spring training)
              statsMap[player.player_id] = {
                isPitcher: false,
                avg: ".---",
                hr: 0,
                rbi: 0,
                ops: ".---",
              };
            }
          }
        } catch (error) {
          console.error(`Failed to fetch stats for player ${player.player_id}:`, error);
        }
      }

      setPlayerStats(statsMap);
    };

    fetchPlayerStats();
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
    <section className="py-8 sm:py-12 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <GlassCard glow="blue" className="p-6 sm:p-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Anthony's Predictions
              </h2>
              <p className="text-sm text-muted-foreground">
                Betting tips updated daily
              </p>
            </div>
          </div>
          {predictions && predictions.length > 0 && (
            <div className="text-xs text-muted-foreground bg-card/50 px-3 py-1 rounded-full">
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
              No predictions for today yet. Generate fresh predictions!
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
                  Generate Today's Predictions
                </>
              )}
            </Button>
          </div>
        )}

        {/* Player Cards Grid */}
        {predictions && predictions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
                        className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                          player.status === "hot"
                            ? "bg-orange-500/90 text-white"
                            : "bg-blue-500/90 text-white"
                        }`}
                      >
                        {player.status === "hot" ? (
                          <>
                            <Flame className="w-3 h-3" />
                            HOT
                          </>
                        ) : (
                          <>
                            <Snowflake className="w-3 h-3" />
                            COLD
                          </>
                        )}
                      </div>

                      {/* Player Image */}
                      <div className="relative h-36 sm:h-44 bg-gradient-to-b from-background to-card overflow-hidden flex items-center justify-center">
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
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-2xl font-bold text-primary">
                                {player.player_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                      </div>

                      {/* Player Info */}
                      <div className="p-3 sm:p-4">
                        <h3 className="font-bold text-white text-sm sm:text-base mb-2 truncate">
                          {player.player_name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {player.description}
                        </p>
                        <p className="text-xs text-primary mt-2 font-medium">
                          Tap for stats →
                        </p>
                      </div>

                      {/* Hot/Cold Indicator Bar */}
                      <div
                        className={`h-1 w-full ${
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

        {/* Baseball Field Depth Chart */}
        {predictions && predictions.length > 0 && (
          <div className="mt-8 relative">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Depth Chart</h3>
            <div className="relative w-full max-w-lg mx-auto aspect-square">
              {/* Faded Baseball Field SVG */}
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full opacity-30"
                style={{ filter: 'drop-shadow(0 0 20px rgba(255, 69, 0, 0.3))' }}
              >
                {/* Outfield grass arc */}
                <path
                  d="M 200 380 L 20 200 A 250 250 0 0 1 380 200 Z"
                  fill="url(#fieldGradient)"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="2"
                />
                {/* Infield diamond */}
                <path
                  d="M 200 320 L 120 240 L 200 160 L 280 240 Z"
                  fill="url(#infieldGradient)"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="2"
                />
                {/* Base paths */}
                <line x1="200" y1="320" x2="120" y2="240" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" />
                <line x1="120" y1="240" x2="200" y2="160" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" />
                <line x1="200" y1="160" x2="280" y2="240" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" />
                <line x1="280" y1="240" x2="200" y2="320" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" />
                {/* Pitcher's mound */}
                <circle cx="200" cy="260" r="8" fill="rgba(255, 69, 0, 0.5)" />
                {/* Bases */}
                <rect x="195" y="315" width="10" height="10" fill="white" transform="rotate(45, 200, 320)" />
                <rect x="115" y="235" width="10" height="10" fill="white" transform="rotate(45, 120, 240)" />
                <rect x="195" y="155" width="10" height="10" fill="white" transform="rotate(45, 200, 160)" />
                <rect x="275" y="235" width="10" height="10" fill="white" transform="rotate(45, 280, 240)" />
                {/* Gradients */}
                <defs>
                  <radialGradient id="fieldGradient" cx="50%" cy="100%" r="100%">
                    <stop offset="0%" stopColor="rgba(34, 139, 34, 0.4)" />
                    <stop offset="100%" stopColor="rgba(0, 100, 0, 0.2)" />
                  </radialGradient>
                  <linearGradient id="infieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(139, 90, 43, 0.4)" />
                    <stop offset="100%" stopColor="rgba(101, 67, 33, 0.3)" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Position Badges */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Pitcher */}
                <div className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">P</span>
                </div>
                {/* Catcher */}
                <div className="absolute left-1/2 top-[82%] -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">C</span>
                </div>
                {/* First Base */}
                <div className="absolute left-[72%] top-[58%] -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">1B</span>
                </div>
                {/* Second Base */}
                <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">2B</span>
                </div>
                {/* Third Base */}
                <div className="absolute left-[28%] top-[58%] -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">3B</span>
                </div>
                {/* Shortstop */}
                <div className="absolute left-[38%] top-[48%] -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">SS</span>
                </div>
                {/* Left Field */}
                <div className="absolute left-[18%] top-[32%] -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-green-600/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">LF</span>
                </div>
                {/* Center Field */}
                <div className="absolute left-1/2 top-[18%] -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-green-600/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">CF</span>
                </div>
                {/* Right Field */}
                <div className="absolute left-[82%] top-[32%] -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-green-600/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">RF</span>
                </div>
                {/* DH - off to the side */}
                <div className="absolute left-[92%] top-[75%] -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-purple-500/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">DH</span>
                </div>
              </div>
            </div>
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
