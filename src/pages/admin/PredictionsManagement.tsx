import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Star, Flame, Snowflake, AlertTriangle, Users, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

// Star players that can be forced into predictions
const STAR_PLAYERS = [
  { id: 596019, name: "Francisco Lindor" },
  { id: 665742, name: "Juan Soto" },
  { id: 607043, name: "Brandon Nimmo" },
  { id: 643446, name: "Jeff McNeil" },
  { id: 668901, name: "Mark Vientos" },
  { id: 682626, name: "Francisco Alvarez" },
  { id: 516782, name: "Starling Marte" },
  { id: 673085, name: "Kodai Senga" },
  { id: 621242, name: "Edwin Diaz" },
  { id: 640455, name: "Sean Manaea" },
];

interface Prediction {
  id: string;
  player_name: string;
  player_id: number | null;
  player_image_url: string | null;
  status: string;
  description: string;
  prediction_date: string;
  created_at: string;
}

export default function PredictionsManagement() {
  const queryClient = useQueryClient();
  const [selectedStarPlayers, setSelectedStarPlayers] = useState<number[]>([]);
  const [forceRegenerate, setForceRegenerate] = useState(false);

  // Fetch today's predictions
  const { data: predictions, isLoading } = useQuery({
    queryKey: ["admin-predictions"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("daily_player_predictions")
        .select("*")
        .eq("prediction_date", today)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Prediction[];
    },
  });

  // Fetch prediction history (last 7 days)
  const { data: history } = useQuery({
    queryKey: ["predictions-history"],
    queryFn: async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from("daily_player_predictions")
        .select("prediction_date")
        .gte("prediction_date", weekAgo.toISOString().split("T")[0])
        .order("prediction_date", { ascending: false });

      if (error) throw error;
      
      // Group by date and count
      const grouped = data.reduce((acc: Record<string, number>, item) => {
        acc[item.prediction_date] = (acc[item.prediction_date] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    },
  });

  // Regenerate predictions mutation
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      // If force regenerate, delete today's predictions first
      if (forceRegenerate && predictions && predictions.length > 0) {
        const today = new Date().toISOString().split("T")[0];
        const { error: deleteError } = await supabase
          .from("daily_player_predictions")
          .delete()
          .eq("prediction_date", today);
        
        if (deleteError) throw deleteError;
      }

      const { data, error } = await supabase.functions.invoke("generate-daily-predictions", {
        body: {
          forceStarPlayers: selectedStarPlayers.length > 0 ? selectedStarPlayers : undefined,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-predictions"] });
      queryClient.invalidateQueries({ queryKey: ["predictions-history"] });
      queryClient.invalidateQueries({ queryKey: ["daily-predictions"] });
      toast.success(data.message || "Predictions regenerated successfully!");
    },
    onError: (error) => {
      console.error("Regeneration error:", error);
      toast.error("Failed to regenerate predictions");
    },
  });

  const toggleStarPlayer = (playerId: number) => {
    setSelectedStarPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : prev.length < 6
        ? [...prev, playerId]
        : prev
    );
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Anthony's Predictions</h1>
        <p className="text-muted-foreground mt-1">
          Manage daily player predictions and force star players
        </p>
      </div>

      {/* Current Predictions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Predictions
              </CardTitle>
              <CardDescription>
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </CardDescription>
            </div>
            <Badge variant={predictions && predictions.length > 0 ? "default" : "secondary"}>
              {predictions?.length || 0} Players
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : predictions && predictions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.map((pred) => (
                <div
                  key={pred.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
                >
                  {pred.player_image_url ? (
                    <img
                      src={pred.player_image_url}
                      alt={pred.player_name}
                      className="w-12 h-12 rounded-full object-cover bg-background"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {pred.player_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{pred.player_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {pred.description}
                    </p>
                  </div>
                  <Badge
                    variant={pred.status === "hot" ? "destructive" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {pred.status === "hot" ? (
                      <Flame className="h-3 w-3" />
                    ) : (
                      <Snowflake className="h-3 w-3" />
                    )}
                    {pred.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No predictions generated for today yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Force Star Players */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Force Star Players
          </CardTitle>
          <CardDescription>
            Select up to 6 players to always include in today's predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {STAR_PLAYERS.map((player) => (
              <div
                key={player.id}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedStarPlayers.includes(player.id)
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => toggleStarPlayer(player.id)}
              >
                <Checkbox
                  checked={selectedStarPlayers.includes(player.id)}
                  onCheckedChange={() => toggleStarPlayer(player.id)}
                  disabled={
                    !selectedStarPlayers.includes(player.id) &&
                    selectedStarPlayers.length >= 6
                  }
                />
                <Label className="cursor-pointer text-sm">{player.name}</Label>
              </div>
            ))}
          </div>
          {selectedStarPlayers.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              {selectedStarPlayers.length} of 6 star players selected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Regenerate Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Regenerate Predictions
          </CardTitle>
          <CardDescription>
            Manually trigger prediction generation for today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictions && predictions.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Predictions already exist</p>
                <p className="text-xs text-muted-foreground">
                  Enable "Force Regenerate" to delete and recreate today's predictions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="force-regen"
                  checked={forceRegenerate}
                  onCheckedChange={(checked) => setForceRegenerate(checked as boolean)}
                />
                <Label htmlFor="force-regen" className="text-sm cursor-pointer">
                  Force Regenerate
                </Label>
              </div>
            </div>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full"
                disabled={
                  regenerateMutation.isPending ||
                  (predictions && predictions.length > 0 && !forceRegenerate)
                }
              >
                {regenerateMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Predictions
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Regenerate Predictions?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>This will generate new AI-powered predictions for today.</p>
                  {selectedStarPlayers.length > 0 && (
                    <p className="text-primary">
                      ⭐ {selectedStarPlayers.length} star player(s) will be forced into the predictions.
                    </p>
                  )}
                  {forceRegenerate && predictions && predictions.length > 0 && (
                    <p className="text-yellow-500">
                      ⚠️ This will delete the existing {predictions.length} predictions.
                    </p>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => regenerateMutation.mutate()}
                  className="bg-primary"
                >
                  Confirm & Generate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* History */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prediction History (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {history.map((item) => (
                <Badge
                  key={item.date}
                  variant={item.date === today ? "default" : "secondary"}
                  className="px-3 py-1"
                >
                  {format(new Date(item.date + "T12:00:00"), "MMM d")} - {item.count} players
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
