import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Clock, MapPin, Video, TrendingUp, Calendar, Trophy } from "lucide-react";
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
  const { data: lineupCard } = useQuery({
    queryKey: ["today-lineup-card"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from("lineup_cards")
        .select("*")
        .eq("published", true)
        .gte("game_date", today.toISOString())
        .order("game_date", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: springGames } = useQuery({
    queryKey: ["spring-training-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spring_training_games")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const lineup = lineupCard?.lineup_data as unknown as LineupPlayer[] | undefined;
  const pitcher = lineupCard?.starting_pitcher as unknown as StartingPitcher | null;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">
          Mets Game Center
        </h2>
        <Link
          to="/video-gallery"
          className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
        >
          <Video className="w-4 h-4" />
          <span className="hidden sm:inline">Video Gallery</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Lineup Card - Compact */}
        <Card className="lg:col-span-2 overflow-hidden border-primary/20">
          <div className="bg-gradient-to-r from-primary to-primary/80 p-3 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">NY</span>
                </div>
                <div>
                  <p className="font-bold text-sm">
                    {lineupCard ? `vs ${lineupCard.opponent}` : "Today's Lineup"}
                  </p>
                  {lineupCard && (
                    <p className="text-xs opacity-90 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(lineupCard.game_date), "MMM d")} • {lineupCard.game_time}
                    </p>
                  )}
                </div>
              </div>
              {lineupCard?.location && (
                <div className="flex items-center gap-1 text-xs opacity-90">
                  <MapPin className="w-3 h-3" />
                  <span className="hidden sm:inline">{lineupCard.location}</span>
                </div>
              )}
            </div>
          </div>

          <CardContent className="p-3">
            {lineupCard && lineup ? (
              <div className="grid grid-cols-2 gap-3">
                {/* Batting Order - Compact Grid */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Batting Order
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {lineup.slice(0, 9).map((player) => (
                      <div
                        key={player.position}
                        className="flex items-center gap-2 py-1 px-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-xs font-bold text-primary w-4">
                          {player.position}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs truncate">{player.name}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {player.fieldPosition}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  {/* Starting Pitcher */}
                  {pitcher && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Starting Pitcher
                      </p>
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
                        <p className="font-bold text-sm">{pitcher.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                            {pitcher.hand}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {pitcher.era} ERA
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {pitcher.strikeouts} K
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Season Stats
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="text-lg font-bold text-primary">45</p>
                        <p className="text-[10px] text-muted-foreground">Wins</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="text-lg font-bold text-primary">32</p>
                        <p className="text-[10px] text-muted-foreground">Losses</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="text-lg font-bold text-primary">1st</p>
                        <p className="text-[10px] text-muted-foreground">NL East</p>
                      </div>
                    </div>
                  </div>

                  {lineupCard.notes && (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">
                      {lineupCard.notes}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No lineup available for today</p>
                <p className="text-xs mt-1">Check back before game time</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Spring Training & Standings */}
        <div className="space-y-4">
          {/* Spring Training Preview */}
          <Card className="border-orange-500/20">
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-2.5 text-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-bold text-sm">Spring Training 2026</span>
              </div>
            </div>
            <CardContent className="p-2.5">
              {springGames && springGames.length > 0 ? (
                <div className="space-y-2">
                  {springGames.map((game) => (
                    <Link
                      key={game.id}
                      to="/spring-training-live"
                      className="flex items-center gap-2 p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <img
                        src={game.preview_image_url}
                        alt={game.opponent}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">vs {game.opponent}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(game.game_date), "MMM d")}
                        </p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to="/spring-training-live"
                    className="block text-center text-xs text-primary hover:underline pt-1"
                  >
                    View All Games →
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No spring games scheduled
                </p>
              )}
            </CardContent>
          </Card>

          {/* NL East Standings */}
          <Card className="border-primary/20">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-2.5 text-white">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="font-bold text-sm">NL East Standings</span>
              </div>
            </div>
            <CardContent className="p-2.5">
              <div className="space-y-1.5">
                {[
                  { team: "Mets", w: 45, l: 32, gb: "-" },
                  { team: "Braves", w: 43, l: 34, gb: "2.0" },
                  { team: "Phillies", w: 42, l: 35, gb: "3.0" },
                  { team: "Marlins", w: 35, l: 42, gb: "10.0" },
                  { team: "Nationals", w: 30, l: 47, gb: "15.0" },
                ].map((team, i) => (
                  <div
                    key={team.team}
                    className={`flex items-center gap-2 p-1.5 rounded text-xs ${
                      team.team === "Mets"
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted/30"
                    }`}
                  >
                    <span className="font-bold w-4 text-center text-muted-foreground">
                      {i + 1}
                    </span>
                    <span
                      className={`flex-1 font-medium ${
                        team.team === "Mets" ? "text-primary" : ""
                      }`}
                    >
                      {team.team}
                    </span>
                    <span className="w-8 text-center">{team.w}</span>
                    <span className="w-8 text-center">{team.l}</span>
                    <span className="w-8 text-center text-muted-foreground">
                      {team.gb}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1 text-[10px] text-muted-foreground border-t border-border mt-2">
                  <span className="w-4" />
                  <span className="flex-1">Team</span>
                  <span className="w-8 text-center">W</span>
                  <span className="w-8 text-center">L</span>
                  <span className="w-8 text-center">GB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Leaders */}
          <Card className="border-primary/20">
            <div className="bg-gradient-to-r from-primary/80 to-primary p-2.5 text-primary-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold text-sm">Team Leaders</span>
              </div>
            </div>
            <CardContent className="p-2.5">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">AVG</p>
                  <p className="font-bold text-sm text-primary">.312</p>
                  <p className="text-[10px] truncate">Lindor</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">HR</p>
                  <p className="font-bold text-sm text-primary">24</p>
                  <p className="text-[10px] truncate">Alonso</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">RBI</p>
                  <p className="font-bold text-sm text-primary">58</p>
                  <p className="text-[10px] truncate">Alonso</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}