import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Flame, Snowflake, Trophy, XCircle, Shield, Share2, TrendingUp, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import metsLogo from "@/assets/metsxmfanzone-logo.png";
import GlassCard from "@/components/GlassCard";
import SEOHead from "@/components/SEOHead";
import { BackButton } from "@/components/BackButton";
import Footer from "@/components/Footer";
import ActiveRosterSection from "@/components/parlays/ActiveRosterSection";
import LineupCardsSection from "@/components/parlays/LineupCardsSection";

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

type FilterType = "all" | "hot" | "cold" | "hitters" | "pitchers";

const PlayerParlays = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [parlaySlip, setParlaySlip] = useState<string[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const { data: predictions, isLoading } = useQuery({
    queryKey: ["player-parlays-page"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("daily_player_predictions")
        .select("*")
        .eq("prediction_date", today)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as unknown as PlayerPrediction[];
    },
  });

  const filteredPredictions = predictions?.filter((p) => {
    if (selectedFilter === "hot") return p.status === "hot";
    if (selectedFilter === "cold") return p.status === "cold";
    if (selectedFilter === "hitters") return !p.is_pitcher;
    if (selectedFilter === "pitchers") return p.is_pitcher;
    return true;
  });

  const toggleParlaySlip = (id: string) => {
    setParlaySlip((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isReliefPitcher = (player: PlayerPrediction) => {
    return player.is_pitcher && (player.predicted_saves > 0 || player.predicted_win_loss === null);
  };

  const shareParlaySlip = async () => {
    if (parlaySlip.length === 0) {
      toast.error("Add players to your parlay slip first!");
      return;
    }
    const selectedPlayers = predictions?.filter((p) => parlaySlip.includes(p.id)) || [];
    const text = selectedPlayers
      .map((p) => {
        if (p.is_pitcher) {
          return `${p.player_name}: ${p.predicted_strikeouts}K, ${p.predicted_innings_pitched}IP${p.predicted_win_loss ? ` (${p.predicted_win_loss})` : ""}`;
        }
        return `${p.player_name}: ${p.predicted_hr}HR, ${p.predicted_rbis}RBI, ${p.predicted_runs}R`;
      })
      .join("\n");

    const shareText = `🎯 Anthony's Parlay Picks\n${new Date().toLocaleDateString()}\n\n${text}\n\n🔥 Built on MetsXMFanZone`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Anthony's Parlay Picks", text: shareText });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Parlay slip copied to clipboard!");
    }
  };

  const hotCount = predictions?.filter((p) => p.status === "hot").length || 0;
  const coldCount = predictions?.filter((p) => p.status === "cold").length || 0;
  const avgConfidence = predictions?.length
    ? Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length)
    : 0;

  const filters: { key: FilterType; label: string; icon?: React.ReactNode }[] = [
    { key: "all", label: "All Picks" },
    { key: "hot", label: "Hot", icon: <Flame className="w-3.5 h-3.5" /> },
    { key: "cold", label: "Cold", icon: <Snowflake className="w-3.5 h-3.5" /> },
    { key: "hitters", label: "Hitters" },
    { key: "pitchers", label: "Pitchers" },
  ];

  return (
    <>
      <SEOHead
        title="Anthony's Player Parlays | MetsXMFanZone"
        description="Daily Mets player stat predictions for your parlays. Get Anthony's hot picks, cold fades, and parlay tips."
      />

      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_70%)]" />
          
          <div className="relative max-w-7xl mx-auto px-4 pt-6 pb-8 sm:px-6 lg:px-8">
            <BackButton />
            
            <div className="flex flex-col items-center text-center mt-4 mb-6">
              <img src={metsLogo} alt="MetsXMFanZone" className="w-14 h-14 sm:w-20 sm:h-20 object-contain mb-3" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                Anthony's Player Parlays
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-lg">
                Daily stat-line predictions to power your parlay picks
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </Badge>
              </div>
            </div>

            {/* Stats Bar */}
            {predictions && predictions.length > 0 && (
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
                <GlassCard className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="text-xl font-bold text-white">{hotCount}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Hot Picks</div>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-xl font-bold text-white">{avgConfidence}%</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Confidence</div>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Snowflake className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold text-white">{coldCount}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Cold Fades</div>
                </GlassCard>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((f) => (
              <Button
                key={f.key}
                variant={selectedFilter === f.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(f.key)}
                className="text-xs"
              >
                {f.icon}
                {f.label}
              </Button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-card/50 rounded-xl animate-pulse border border-border/30" />
              ))}
            </div>
          )}

          {/* No Predictions */}
          {!isLoading && (!predictions || predictions.length === 0) && (
            <GlassCard glow="blue" className="p-12 text-center">
              <TrendingUp className="w-16 h-16 text-primary/50 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Today's Picks Coming Soon</h2>
              <p className="text-muted-foreground">Anthony's parlay predictions will be available shortly.</p>
            </GlassCard>
          )}

          {/* Player Cards Grid */}
          {filteredPredictions && filteredPredictions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredPredictions.map((player) => {
                  const isInSlip = parlaySlip.includes(player.id);
                  const isExpanded = expandedCard === player.id;
                  const isRP = isReliefPitcher(player);

                  return (
                    <motion.div
                      key={player.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`relative bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
                          isInSlip
                            ? "border-green-500 shadow-green-500/20 ring-1 ring-green-500/30"
                            : player.status === "hot"
                            ? "border-orange-500/50 hover:border-orange-500 shadow-orange-500/10"
                            : "border-blue-500/50 hover:border-blue-500 shadow-blue-500/10"
                        }`}
                        onClick={() => setExpandedCard(isExpanded ? null : player.id)}
                      >
                        {/* Top Row: Player Info */}
                        <div className="flex items-start gap-3 p-4">
                          {/* Player Image */}
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-b from-background to-card">
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
                                <span className="text-2xl font-bold text-primary">
                                  {player.player_name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Name & Badges */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-base sm:text-lg truncate">
                              {player.player_name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <Badge
                                className={`text-[10px] px-1.5 py-0 ${
                                  player.status === "hot"
                                    ? "bg-orange-500/90 text-white border-orange-500"
                                    : "bg-blue-500/90 text-white border-blue-500"
                                }`}
                              >
                                {player.status === "hot" ? (
                                  <><Flame className="w-3 h-3 mr-0.5" />HOT</>
                                ) : (
                                  <><Snowflake className="w-3 h-3 mr-0.5" />COLD</>
                                )}
                              </Badge>

                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/50 text-primary">
                                {player.confidence}%
                              </Badge>

                              {player.is_pitcher && player.predicted_win_loss && (
                                <Badge
                                  className={`text-[10px] px-1.5 py-0 ${
                                    player.predicted_win_loss === "W"
                                      ? "bg-green-500/90 text-white"
                                      : "bg-red-500/90 text-white"
                                  }`}
                                >
                                  {player.predicted_win_loss === "W" ? (
                                    <><Trophy className="w-3 h-3 mr-0.5" />WIN</>
                                  ) : (
                                    <><XCircle className="w-3 h-3 mr-0.5" />LOSS</>
                                  )}
                                </Badge>
                              )}
                              {player.is_pitcher && isRP && player.predicted_saves > 0 && (
                                <Badge className="text-[10px] px-1.5 py-0 bg-yellow-500/90 text-white">
                                  <Shield className="w-3 h-3 mr-0.5" />SV
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stat Props - Sportsbook Style */}
                        <div className="px-4 pb-3">
                          {player.is_pitcher ? (
                            <div className="grid grid-cols-3 gap-2">
                              <PropLine label="Strikeouts" value={player.predicted_strikeouts} color="text-primary" />
                              <PropLine label="Innings" value={player.predicted_innings_pitched} color="text-white" />
                              <PropLine label="BB Allowed" value={player.predicted_walks_allowed} color="text-yellow-400" />
                            </div>
                          ) : (
                            <div className="grid grid-cols-4 gap-1.5">
                              <PropLine label="HR" value={player.predicted_hr} color="text-primary" />
                              <PropLine label="RBI" value={player.predicted_rbis} color="text-green-400" />
                              <PropLine label="Runs" value={player.predicted_runs} color="text-cyan-400" />
                              <PropLine label="BB" value={player.predicted_walks} color="text-white" />
                            </div>
                          )}
                        </div>

                        {/* Confidence Bar */}
                        <div className="px-4 pb-3">
                          <div className="w-full bg-background/50 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                player.confidence >= 70
                                  ? "bg-green-500"
                                  : player.confidence >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${player.confidence}%` }}
                            />
                          </div>
                        </div>

                        {/* Expanded: Parlay Tip */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-1 border-t border-border/30">
                                <div className="text-xs text-primary font-semibold mb-1.5">
                                  🎯 Anthony's Parlay Tip
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {player.description}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Add to Slip Button */}
                        <div
                          className={`flex items-center justify-between px-4 py-2.5 border-t transition-colors ${
                            isInSlip
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-card/50 border-border/30 hover:bg-primary/5"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleParlaySlip(player.id);
                          }}
                        >
                          <span className="text-xs font-medium text-muted-foreground">
                            {isInSlip ? "Added to slip" : "Add to parlay slip"}
                          </span>
                          <CheckCircle
                            className={`w-5 h-5 transition-colors ${
                              isInSlip ? "text-green-500" : "text-muted-foreground/30"
                            }`}
                          />
                        </div>

                        {/* Status Strip */}
                        <div
                          className={`h-1 w-full ${
                            player.status === "hot"
                              ? "bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500"
                              : "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400"
                          }`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Floating Parlay Slip */}
          <AnimatePresence>
            {parlaySlip.length > 0 && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50"
              >
                <GlassCard glow="blue" className="p-4 shadow-2xl border-primary/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <img src={metsLogo} alt="" className="w-5 h-5 object-contain" />
                      <h3 className="font-bold text-white text-sm">Parlay Slip</h3>
                    </div>
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      {parlaySlip.length} pick{parlaySlip.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
                    {predictions
                      ?.filter((p) => parlaySlip.includes(p.id))
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs bg-background/30 rounded-lg px-2.5 py-1.5"
                        >
                          <span className="text-white font-medium truncate">{p.player_name}</span>
                          <div className="flex items-center gap-1.5">
                            {p.is_pitcher ? (
                              <span className="text-muted-foreground">{p.predicted_strikeouts}K</span>
                            ) : (
                              <span className="text-muted-foreground">
                                {p.predicted_hr}HR {p.predicted_rbis}RBI
                              </span>
                            )}
                            <button
                              onClick={() => toggleParlaySlip(p.id)}
                              className="text-red-400 hover:text-red-300 ml-1"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={shareParlaySlip}
                      className="flex-1 bg-primary hover:bg-primary/90 text-xs h-9"
                    >
                      <Share2 className="w-3.5 h-3.5 mr-1.5" />
                      Share Parlay
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setParlaySlip([])}
                      className="text-xs h-9"
                    >
                      Clear
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Roster */}
          {predictions && predictions.length > 0 && (
            <ActiveRosterSection
              players={predictions}
              parlaySlip={parlaySlip}
              onTogglePlayer={toggleParlaySlip}
            />
          )}

          {/* Lineup Cards */}
          <LineupCardsSection />

          {/* Disclaimer */}
          {predictions && predictions.length > 0 && (
            <p className="text-center text-xs text-muted-foreground mt-8">
              🎲 Parlay predictions for entertainment purposes only. Always bet responsibly.
            </p>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

/* Sportsbook-style prop line component */
const PropLine = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="bg-background/60 rounded-lg p-2 text-center">
    <div className={`text-lg font-bold ${color}`}>{value}</div>
    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
  </div>
);

export default PlayerParlays;
