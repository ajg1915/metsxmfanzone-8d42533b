import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Clock, MapPin, Video } from "lucide-react";
import { format } from "date-fns";
interface LineupPlayer {
  position: number;
  name: string;
  fieldPosition: string;
  imageUrl?: string;
}
interface StartingPitcher {
  name: string;
  hand: string;
  era: string;
  strikeouts: string;
}
export default function HomeLineupCard() {
  const {
    data: lineupCard
  } = useQuery({
    queryKey: ["today-lineup-card"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const {
        data,
        error
      } = await supabase.from("lineup_cards").select("*").eq("published", true).gte("game_date", today.toISOString()).order("game_date", {
        ascending: true
      }).limit(1).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  if (!lineupCard) return null;
  const lineup = lineupCard.lineup_data as unknown as LineupPlayer[];
  const pitcher = lineupCard.starting_pitcher as unknown as StartingPitcher | null;
  return <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Today's Mets Lineup
        </h2>
        <Link to="/video-gallery" className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors text-sm">
          <Video className="w-4 h-4" />
          <span className="font-medium">Video Gallery</span>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>
                {format(new Date(lineupCard.game_date), "EEEE, MMMM d, yyyy")} at{" "}
                {lineupCard.game_time}
              </span>
            </div>
            <div className="text-lg font-bold">vs {lineupCard.opponent}</div>
            {lineupCard.location && <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{lineupCard.location}</span>
              </div>}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-base mb-2">Batting Order</h3>
              <div className="space-y-1.5">
                {lineup.map(player => <div key={player.position} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/30 transition-colors">
                    <span className="text-base font-bold text-primary w-6">
                      {player.position}
                    </span>
                    {player.imageUrl && <img src={player.imageUrl} alt={player.name} className="w-8 h-8 rounded-full object-cover" />}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{player.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {player.fieldPosition}
                      </p>
                    </div>
                  </div>)}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">Starting Pitcher</h3>
              {pitcher && <div className="bg-primary/10 rounded-lg p-3">
                  <p className="font-medium text-base">{pitcher.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {pitcher.hand} • {pitcher.era} ERA • {pitcher.strikeouts} K
                  </p>
                </div>}

              {lineupCard.notes && <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Notes</h4>
                  <p className="text-xs text-muted-foreground">
                    {lineupCard.notes}
                  </p>
                </div>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}