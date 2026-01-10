import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Snowflake, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface PlayerPrediction {
  id: string;
  player_name: string;
  player_id: number | null;
  player_image_url: string | null;
  status: "hot" | "cold";
  description: string;
  prediction_date: string;
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
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as PlayerPrediction[];
    },
  });

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

  // If no predictions for today, try to generate them
  const shouldGenerate = !isLoading && (!predictions || predictions.length === 0);

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Players to Watch
              </h2>
              <p className="text-sm text-muted-foreground">
                Daily AI-powered predictions & betting tips
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
              No predictions for today yet. Generate fresh AI predictions!
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {predictions.map((player) => (
              <div
                key={player.id}
                className={`relative bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  player.status === "hot" 
                    ? "border-orange-500 shadow-orange-500/20" 
                    : "border-blue-500 shadow-blue-500/20"
                }`}
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
                <div className="relative h-32 sm:h-40 bg-gradient-to-b from-background to-card overflow-hidden">
                  {player.player_image_url ? (
                    <img
                      src={player.player_image_url}
                      alt={player.player_name}
                      className="w-full h-full object-cover object-top"
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
            ))}
          </div>
        )}

        {/* Disclaimer */}
        {predictions && predictions.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            🎲 AI-generated predictions for entertainment purposes. Always bet responsibly.
          </p>
        )}
      </div>
    </section>
  );
};

export default PlayersToWatch;
