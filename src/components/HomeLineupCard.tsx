import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, MapPin, Video, TrendingUp, Calendar, Trophy, ChevronDown, RefreshCw, User } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

import springAstros from "@/assets/spring-mets-astros.jpg";
import springBraves from "@/assets/spring-mets-braves.jpg";
import springCards from "@/assets/spring-mets-cards.jpg";
import springNats from "@/assets/spring-mets-nats.jpg";
import springRedsox from "@/assets/spring-mets-redsox.jpg";
import springYankees from "@/assets/spring-mets-yankees.jpg";
import springDefault from "@/assets/spring-training.jpg";

const getSpringFallback = (opponent: string): string => {
  const name = opponent.toLowerCase();
  if (name.includes("astros") || name.includes("houston")) return springAstros;
  if (name.includes("braves") || name.includes("atlanta")) return springBraves;
  if (name.includes("cardinal") || name.includes("stl")) return springCards;
  if (name.includes("national") || name.includes("washington")) return springNats;
  if (name.includes("red sox") || name.includes("boston")) return springRedsox;
  if (name.includes("yankee") || name.includes("new york")) return springYankees;
  return springDefault;
};
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
interface MLBStanding {
  team: {
    name: string;
  };
  wins: number;
  losses: number;
  gamesBack: string;
  divisionRank: string;
}
interface MLBLeader {
  person: {
    fullName: string;
  };
  value: string;
}
interface HomeLineupCardProps {
  className?: string;
  onLineupLoaded?: (gameDate?: string) => void;
}

interface UpcomingGame {
  date: string;
  opponent: string;
  isHome: boolean;
  time: string;
  probablePitcher?: {
    name: string;
    hand: string;
  };
}
export default function HomeLineupCard({
  className,
  onLineupLoaded
}: HomeLineupCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRefreshLineup = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-mets-lineup");
      
      if (error) throw error;
      
      // Invalidate the lineup query to refetch from database
      await queryClient.invalidateQueries({ queryKey: ["today-lineup-card"] });
      
      toast({
        title: "Lineup Updated",
        description: data.playersInLineup > 0 
          ? `Found ${data.playersInLineup} players in lineup` 
          : data.message || "No lineup available yet",
      });
    } catch (err) {
      console.error("Error refreshing lineup:", err);
      toast({
        title: "Refresh Failed",
        description: "Could not fetch lineup data. Try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  const {
    data: lineupCard,
    isFetched: lineupFetched
  } = useQuery({
    queryKey: ["today-lineup-card"],
    queryFn: async () => {
      // Use UTC midnight to match DB timestamps stored in UTC
      const now = new Date();
      const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const {
        data,
        error
      } = await supabase.from("lineup_cards").select("*").eq("published", true).gte("game_date", todayUTC.toISOString()).order("game_date", {
        ascending: true
      }).limit(1).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const {
    data: springGames
  } = useQuery({
    queryKey: ["spring-training-preview"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("spring_training_games").select("*").eq("published", true).order("display_order", {
        ascending: true
      }).limit(3);
      if (error) throw error;
      return data;
    }
  });

  // Upcoming Mets games with probable pitchers from MLB API
  const {
    data: upcomingGames
  } = useQuery({
    queryKey: ["mlb-mets-upcoming-games"],
    queryFn: async (): Promise<UpcomingGame[]> => {
      const today = new Date();
      const startDate = today.toISOString().split("T")[0];
      const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      
      const response = await fetch(
        `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=121&startDate=${startDate}&endDate=${endDate}&hydrate=probablePitcher,team`
      );
      const data = await response.json();
      
      if (!data.dates || data.dates.length === 0) return [];
      
      const games: UpcomingGame[] = [];
      for (const dateEntry of data.dates) {
        for (const game of dateEntry.games) {
          const isHome = game.teams.home.team.id === 121;
          const opponent = isHome ? game.teams.away.team.name : game.teams.home.team.name;
          const metsPitcher = isHome ? game.teams.home.probablePitcher : game.teams.away.probablePitcher;
          
          const gameDateTime = new Date(game.gameDate);
          const timeStr = gameDateTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: "America/New_York"
          });
          
          games.push({
            date: dateEntry.date,
            opponent: opponent.replace("New York ", "").replace("Los Angeles ", "").replace("San Francisco ", "").replace("San Diego ", ""),
            isHome,
            time: timeStr,
            probablePitcher: metsPitcher ? {
              name: metsPitcher.fullName,
              hand: metsPitcher.pitchHand?.code === "R" ? "RHP" : metsPitcher.pitchHand?.code === "L" ? "LHP" : ""
            } : undefined
          });
        }
      }
      
      return games.slice(0, 5); // Get next 5 games
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000
  });

  // Real-time NL East Standings from MLB API - 2026 Season
  const {
    data: standings
  } = useQuery({
    queryKey: ["mlb-nl-east-standings-2026"],
    queryFn: async () => {
      const response = await fetch("https://statsapi.mlb.com/api/v1/standings?leagueId=104&season=2026&standingsTypes=regularSeason");
      const data = await response.json();
      // NL East is division ID 204
      const nlEast = data.records?.find((r: any) => r.division?.id === 204);
      if (!nlEast) return [];
      return nlEast.teamRecords.map((team: any) => ({
        team_name: team.team.name.replace("New York ", "").replace("Atlanta ", "").replace("Philadelphia ", "").replace("Miami ", "").replace("Washington ", ""),
        wins: team.wins,
        losses: team.losses,
        games_back: team.gamesBack === "-" ? "-" : team.gamesBack,
        position: parseInt(team.divisionRank)
      }));
    },
    staleTime: 5 * 60 * 1000,
    // 5 minutes
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });

  // Real-time Mets Team Leaders from MLB API - 2026 Season
  const {
    data: teamLeaders
  } = useQuery({
    queryKey: ["mlb-mets-leaders-2026"],
    queryFn: async () => {
      const now = new Date();
      const currentSeason = now.getFullYear();
      // MLB leader endpoints commonly have no team leader data before regular season starts
      const primarySeason = now.getMonth() < 3 ? currentSeason - 1 : currentSeason;
      const fallbackSeason = primarySeason - 1;

      const fetchLeaderCategory = async (category: string) => {
        const buildUrl = (season: number) =>
          `https://statsapi.mlb.com/api/v1/teams/121/leaders?leaderCategories=${category}&season=${season}&limit=1`;

        const primaryRes = await fetch(buildUrl(primarySeason));
        const response = primaryRes.ok ? primaryRes : await fetch(buildUrl(fallbackSeason));

        if (!response.ok) return null;

        const data = await response.json();
        const leaders = data.teamLeaders?.[0]?.leaders;

        if (leaders && leaders.length > 0) {
          return {
            name: leaders[0].person.fullName,
            value: leaders[0].value,
          };
        }

        return null;
      };

      const [AVG, HR, RBI, ERA, W, SO] = await Promise.all([
        fetchLeaderCategory("battingAverage"),
        fetchLeaderCategory("homeRuns"),
        fetchLeaderCategory("runsBattedIn"),
        fetchLeaderCategory("earnedRunAverage"),
        fetchLeaderCategory("wins"),
        fetchLeaderCategory("strikeouts"),
      ]);

      return { AVG, HR, RBI, ERA, W, SO };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  });
  const lineup = lineupCard?.lineup_data as unknown as LineupPlayer[] | undefined;
  const hasLineup = lineup && Array.isArray(lineup) && lineup.length > 0;
  const pitcher = lineupCard?.starting_pitcher as unknown as StartingPitcher | null;
  const metsStanding = standings?.find((s: any) => s.team_name === "Mets");

  // Notify parent when lineup query completes (even if no game today)
  useEffect(() => {
    if (onLineupLoaded && lineupFetched) {
      onLineupLoaded(lineupCard?.game_date);
    }
  }, [lineupCard, onLineupLoaded, lineupFetched]);
  const ScrollIndicator = () => <div className="flex justify-center py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground animate-gentle-bounce">
        <ChevronDown className="w-4 h-4" />
        <span className="text-[10px] uppercase tracking-wider font-medium">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>;
  return <section className="py-10 sm:py-12 md:py-16 relative overflow-hidden">
      {/* Blue glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, hsl(220 80% 50% / 0.08), transparent 70%)",
        }}
      />
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
      {/* Top Scroll Indicator */}
      

      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">
          Mets Game Center
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshLineup}
            disabled={isRefreshing}
            className="text-primary hover:text-primary/80 hover:bg-primary/10 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Link to="/video-gallery" className="flex items-center gap-1 sm:gap-1.5 text-primary hover:text-primary/80 transition-colors text-xs sm:text-sm font-medium">
            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Video Gallery</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Lineup Card - Compact */}
        <Card className="lg:col-span-2 overflow-hidden border-primary/20">
          <div className="bg-gradient-to-r from-primary/80 to-primary p-3 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">NY</span>
                </div>
                <div>
                  <p className="font-bold text-sm">
                    {lineupCard ? `vs ${lineupCard.opponent}` : "Today's Lineup"}
                  </p>
                  {lineupCard && <p className="text-xs opacity-90 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(lineupCard.game_date), "MMM d")} • {lineupCard.game_time}
                    </p>}
                </div>
              </div>
              <Link to="/mets-roster" className="flex items-center gap-1 text-xs opacity-90 hover:opacity-100 transition-opacity underline">
                <span>Roster</span>
              </Link>
            </div>
          </div>

          <CardContent className="p-3 lg:p-5">
            {hasLineup ? <div className="grid grid-cols-2 gap-3 lg:gap-5">
                {/* Batting Order - Compact Grid */}
                <div>
                  <p className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 lg:mb-3">
                    Batting Order
                  </p>
                  <div className="grid grid-cols-1 gap-1 lg:gap-2">
                    {lineup.slice(0, 9).map(player => <div key={player.position} className="flex items-center gap-2 lg:gap-3 py-1 lg:py-2.5 px-2 lg:px-4 rounded bg-muted/30 hover:bg-muted/50 transition-colors">
                        <span className="text-xs lg:text-base font-bold text-primary w-4 lg:w-6">
                          {player.position}
                        </span>
                        {player.imageUrl && <img src={player.imageUrl} alt={player.name} className="hidden lg:block w-10 h-10 rounded-full object-cover border-2 border-primary/30" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs lg:text-base truncate">{player.name}</p>
                        </div>
                        <span className="text-[10px] lg:text-sm text-muted-foreground font-mono">
                          {player.fieldPosition}
                        </span>
                      </div>)}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3 lg:space-y-4">
                  {/* Starting Pitcher */}
                  {pitcher && <div>
                      <p className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 lg:mb-3">
                        Starting Pitcher
                      </p>
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 lg:p-4 border border-primary/20">
                        <p className="font-bold text-sm lg:text-lg">{pitcher.name}</p>
                        <div className="flex items-center gap-2 lg:gap-3 mt-1 lg:mt-2">
                          <span className="text-xs lg:text-sm bg-primary/20 text-primary px-1.5 lg:px-2.5 py-0.5 lg:py-1 rounded font-medium">
                            {pitcher.hand}
                          </span>
                          <span className="text-xs lg:text-sm text-muted-foreground">
                            {pitcher.era} ERA
                          </span>
                          <span className="text-xs lg:text-sm text-muted-foreground">
                            {pitcher.strikeouts} K
                          </span>
                        </div>
                      </div>
                    </div>}

                  {/* Quick Stats from MLB API */}
                  <div>
                    <p className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 lg:mb-3">
                      2026 Season Stats
                    </p>
                    <div className="grid grid-cols-3 gap-2 lg:gap-3">
                      <div className="bg-muted/50 rounded p-2 lg:p-3 text-center">
                        <p className="text-lg lg:text-2xl font-bold text-primary">
                          {metsStanding?.wins || "-"}
                        </p>
                        <p className="text-[10px] lg:text-xs text-muted-foreground">Wins</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2 lg:p-3 text-center">
                        <p className="text-lg lg:text-2xl font-bold text-primary">
                          {metsStanding?.losses || "-"}
                        </p>
                        <p className="text-[10px] lg:text-xs text-muted-foreground">Losses</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2 lg:p-3 text-center">
                        <p className="text-lg lg:text-2xl font-bold text-primary">
                          {metsStanding?.position || "-"}
                          {metsStanding?.position === 1 ? "st" : metsStanding?.position === 2 ? "nd" : metsStanding?.position === 3 ? "rd" : "th"}
                        </p>
                        <p className="text-[10px] lg:text-xs text-muted-foreground">NL East</p>
                      </div>
                    </div>
                  </div>

                  {lineupCard.notes && <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">
                      {lineupCard.notes}
                    </p>}
                </div>
              </div> : <div className="grid grid-cols-2 gap-3 lg:gap-5">
                {/* Lineup TBA */}
                <div>
                  <p className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 lg:mb-3">
                    Batting Order
                  </p>
                  <div className="grid grid-cols-1 gap-1 lg:gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(pos => (
                      <div key={pos} className="flex items-center gap-2 lg:gap-3 py-1 lg:py-2.5 px-2 lg:px-4 rounded bg-muted/30">
                        <span className="text-xs lg:text-base font-bold text-primary w-4 lg:w-6">
                          {pos}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs lg:text-base text-muted-foreground italic">TBA</p>
                        </div>
                        <span className="text-[10px] lg:text-sm text-muted-foreground font-mono">
                          --
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - TBA State */}
                <div className="space-y-3 lg:space-y-4">
                  <div>
                    <p className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 lg:mb-3">
                      Starting Pitcher
                    </p>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 lg:p-4 border border-primary/20">
                      <p className="font-bold text-sm lg:text-lg text-muted-foreground italic">TBA</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Lineup typically released 1-2 hours before game time
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats - Still show live stats */}
                  <div>
                    <p className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 lg:mb-3">
                      2025 Season Stats
                    </p>
                    <div className="grid grid-cols-3 gap-2 lg:gap-3">
                      <div className="bg-muted/50 rounded p-2 lg:p-3 text-center">
                        <p className="text-lg lg:text-2xl font-bold text-primary">
                          {metsStanding?.wins || "-"}
                        </p>
                        <p className="text-[10px] lg:text-xs text-muted-foreground">Wins</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2 lg:p-3 text-center">
                        <p className="text-lg lg:text-2xl font-bold text-primary">
                          {metsStanding?.losses || "-"}
                        </p>
                        <p className="text-[10px] lg:text-xs text-muted-foreground">Losses</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2 lg:p-3 text-center">
                        <p className="text-lg lg:text-2xl font-bold text-primary">
                          {metsStanding?.position || "-"}
                          {metsStanding?.position === 1 ? "st" : metsStanding?.position === 2 ? "nd" : metsStanding?.position === 3 ? "rd" : "th"}
                        </p>
                        <p className="text-[10px] lg:text-xs text-muted-foreground">NL East</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>}
          </CardContent>
        </Card>

        {/* Right Column - Spring Training & Standings */}
        <div className="space-y-4">
          {/* Upcoming Games with Probable Pitchers */}
          <Card className="border-primary/20">
            <div className="p-2.5 text-white" style={{ background: "linear-gradient(to right, #ff4500, #ff6a33)" }}>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-bold text-sm">Probable Pitchers</span>
              </div>
            </div>
            <CardContent className="p-2.5">
              {upcomingGames && upcomingGames.length > 0 ? (
                <div className="space-y-2">
                  {upcomingGames.map((game, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">
                          {game.isHome ? "vs" : "@"} {game.opponent}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(game.date), "EEE, MMM d")} • {game.time}
                        </p>
                      </div>
                      <div className="text-right">
                        {game.probablePitcher ? (
                          <>
                            <p className="text-xs font-medium text-primary truncate max-w-[80px]">
                              {game.probablePitcher.name.split(" ").pop()}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {game.probablePitcher.hand}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">TBA</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <Link to="/mets-scores" className="block text-center text-xs text-primary hover:underline pt-1">
                    View All Games →
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No upcoming games
                </p>
              )}
            </CardContent>
          </Card>

          {/* Spring Training Preview */}
          <Card className="border-primary/20">
            <div className="bg-gradient-to-r from-primary/80 to-primary p-2.5 text-primary-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-bold text-sm">Spring Training 2026</span>
              </div>
            </div>
            <CardContent className="p-2.5">
              {springGames && springGames.length > 0 ? <div className="space-y-2">
                  {springGames.map(game => <Link key={game.id} to="/spring-training-live" className="flex items-center gap-2 p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors">
                      <img src={game.preview_image_url || getSpringFallback(game.opponent)} alt={game.opponent} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">vs {game.opponent}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(game.game_date), "MMM d")}
                        </p>
                      </div>
                    </Link>)}
                  <Link to="/spring-training-live" className="block text-center text-xs text-primary hover:underline pt-1">
                    View All Games →
                  </Link>
                </div> : <p className="text-xs text-muted-foreground text-center py-2">
                  No spring games scheduled
                </p>}
            </CardContent>
          </Card>

          {/* NL East Standings - Real-time from MLB API */}
          <Card className="border-primary/20">
            <div className="p-2.5 text-white" style={{ background: "linear-gradient(to right, #ff4500, #ff6a33)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span className="font-bold text-sm">NL East Standings</span>
                </div>
                <Link to="/nl-scores" className="text-xs underline hover:text-white/80">
                  NL Scores
                </Link>
              </div>
            </div>
            <CardContent className="p-2.5">
              <div className="space-y-1.5">
                {standings && standings.length > 0 ? <>
                    {standings.map((team: any) => <div key={team.team_name} className={`flex items-center gap-2 p-1.5 rounded text-xs ${team.team_name === "Mets" ? "bg-primary/10 border border-primary/20" : "bg-muted/30"}`}>
                        <span className="font-bold w-4 text-center text-muted-foreground">
                          {team.position}
                        </span>
                        <span className={`flex-1 font-medium ${team.team_name === "Mets" ? "text-primary" : ""}`}>
                          {team.team_name}
                        </span>
                        <span className="w-8 text-center">{team.wins}</span>
                        <span className="w-8 text-center">{team.losses}</span>
                        <span className="w-8 text-center text-muted-foreground">
                          {team.games_back}
                        </span>
                      </div>)}
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-muted-foreground border-t border-border mt-2">
                      <span className="w-4" />
                      <span className="flex-1">Team</span>
                      <span className="w-8 text-center">W</span>
                      <span className="w-8 text-center">L</span>
                      <span className="w-8 text-center">GB</span>
                    </div>
                  </> : <p className="text-xs text-muted-foreground text-center py-2">
                    Season not started
                  </p>}
              </div>
            </CardContent>
          </Card>

          {/* Team Leaders - Real-time from MLB API */}
          <Card className="border-primary/20">
            <div className="bg-gradient-to-r from-primary/80 to-primary p-2.5 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-bold text-sm">Team Leaders</span>
                </div>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">2025</span>
              </div>
            </div>
            <CardContent className="p-2.5">
              <div className="grid grid-cols-3 gap-2 text-center">
                {teamLeaders?.AVG && <div>
                    <p className="text-[10px] text-muted-foreground uppercase">AVG</p>
                    <p className="font-bold text-sm text-primary">{teamLeaders.AVG.value}</p>
                    <p className="text-[10px] truncate">{teamLeaders.AVG.name.split(" ").pop()}</p>
                  </div>}
                {teamLeaders?.HR && <div>
                    <p className="text-[10px] text-muted-foreground uppercase">HR</p>
                    <p className="font-bold text-sm text-primary">{teamLeaders.HR.value}</p>
                    <p className="text-[10px] truncate">{teamLeaders.HR.name.split(" ").pop()}</p>
                  </div>}
                {teamLeaders?.RBI && <div>
                    <p className="text-[10px] text-muted-foreground uppercase">RBI</p>
                    <p className="font-bold text-sm text-primary">{teamLeaders.RBI.value}</p>
                    <p className="text-[10px] truncate">{teamLeaders.RBI.name.split(" ").pop()}</p>
                  </div>}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mt-2 pt-2 border-t border-border">
                {teamLeaders?.ERA && <div>
                    <p className="text-[10px] text-muted-foreground uppercase">ERA</p>
                    <p className="font-bold text-sm text-primary">{teamLeaders.ERA.value}</p>
                    <p className="text-[10px] truncate">{teamLeaders.ERA.name.split(" ").pop()}</p>
                  </div>}
                {teamLeaders?.W && <div>
                    <p className="text-[10px] text-muted-foreground uppercase">W</p>
                    <p className="font-bold text-sm text-primary">{teamLeaders.W.value}</p>
                    <p className="text-[10px] truncate">{teamLeaders.W.name.split(" ").pop()}</p>
                  </div>}
                {teamLeaders?.SO && <div>
                    <p className="text-[10px] text-muted-foreground uppercase">K</p>
                    <p className="font-bold text-sm text-primary">{teamLeaders.SO.value}</p>
                    <p className="text-[10px] truncate">{teamLeaders.SO.name.split(" ").pop()}</p>
                  </div>}
              </div>
              {!teamLeaders?.AVG && !teamLeaders?.HR && <p className="text-xs text-muted-foreground text-center py-2">
                  Season stats coming soon
                </p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      
    </div>
  </section>;
}