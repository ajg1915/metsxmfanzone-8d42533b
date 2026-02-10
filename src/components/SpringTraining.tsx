import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, Play, MapPin, Clock } from "lucide-react";

import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import PremiumBadge from "@/components/PremiumBadge";
import { useSubscription } from "@/hooks/useSubscription";

// Local fan art imports
import marlinsArt from "@/assets/spring-mets-marlins.jpg";
import yankeesArt from "@/assets/spring-mets-yankees.jpg";
import bluejaysArt from "@/assets/spring-mets-bluejays.jpg";
import astrosArt from "@/assets/spring-mets-astros.jpg";
import cardinalsArt from "@/assets/spring-mets-cards.jpg";
import nationalsArt from "@/assets/spring-mets-nats.jpg";
import bravesArt from "@/assets/spring-mets-braves-new.jpg";
import redsoxArt from "@/assets/spring-mets-redsox.jpg";
import defaultArt from "@/assets/spring-training.jpg";

// Map opponent names to local fan art
const opponentArtMap: Record<string, string> = {
  "marlins": marlinsArt,
  "miami": marlinsArt,
  "yankees": yankeesArt,
  "blue jays": bluejaysArt,
  "bluejays": bluejaysArt,
  "toronto": bluejaysArt,
  "astros": astrosArt,
  "houston": astrosArt,
  "cardinals": cardinalsArt,
  "stl": cardinalsArt,
  "st. louis": cardinalsArt,
  "nationals": nationalsArt,
  "washington": nationalsArt,
  "braves": bravesArt,
  "atlanta": bravesArt,
  "red sox": redsoxArt,
  "redsox": redsoxArt,
  "boston": redsoxArt,
};

function getOpponentArt(opponent: string): string {
  const lower = opponent.toLowerCase();
  for (const [key, art] of Object.entries(opponentArtMap)) {
    if (lower.includes(key)) return art;
  }
  return defaultArt;
}

function getOpponentSlug(opponent: string): string {
  const lower = opponent.toLowerCase();
  if (lower.includes("yankees") || lower.includes("new york y")) return "yankees";
  if (lower.includes("red sox") || lower.includes("boston")) return "redsox";
  if (lower.includes("astros") || lower.includes("houston")) return "astros";
  if (lower.includes("cardinals") || lower.includes("stl") || lower.includes("st. louis")) return "cardinals";
  if (lower.includes("nationals") || lower.includes("washington")) return "nationals";
  if (lower.includes("braves") || lower.includes("atlanta")) return "braves";
  if (lower.includes("blue jays") || lower.includes("toronto") || lower.includes("bluejays")) return "bluejays";
  if (lower.includes("marlins") || lower.includes("miami")) return "marlins";
  return lower.replace(/\s+/g, '');
}

function formatGameDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getShortOpponent(opponent: string): string {
  return opponent
    .replace("New York ", "")
    .replace("Toronto ", "")
    .replace("Houston ", "")
    .replace("St. Louis ", "STL ")
    .replace("STL ", "")
    .replace("Washington ", "")
    .replace("Atlanta ", "")
    .replace("Miami ", "")
    .replace("Boston ", "");
}

interface SpringTrainingProps {
  className?: string;
}

export default function SpringTraining({ className }: SpringTrainingProps) {
  const { tier, isAdmin } = useSubscription();
  const isPremium = isAdmin || tier === "premium" || tier === "annual";
  
  const { data: games, isLoading } = useQuery({
    queryKey: ["spring-training-games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spring_training_games")
        .select("*")
        .eq("published", true)
        .order("game_date", { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Filter to upcoming or recent games
  const now = new Date();
  const upcomingGames = games?.filter(g => {
    const gameDate = new Date(g.game_date + "T23:59:59");
    return gameDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  }) || [];

  const displayGames = upcomingGames.length > 0 ? upcomingGames.slice(0, 6) : (games || []).slice(0, 6);

  return (
    <section className="py-8 sm:py-10 md:py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="flex flex-col gap-2 mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-foreground whitespace-nowrap">
                Spring Training 2026
              </h2>
              {!isPremium && <PremiumBadge size="sm" noGlow />}
            </div>
            <Link 
              to="/mets-schedule-2026" 
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-[10px] sm:text-xs transition-colors group flex-shrink-0"
            >
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Full 2026 Schedule</span>
              <span className="sm:hidden">Schedule</span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <p className="text-muted-foreground text-[10px] sm:text-xs">
            Live from Florida — real matchups from the MLB schedule
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-video bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : displayGames.length > 0 ? (
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayGames.map((game, index) => {
              const slug = getOpponentSlug(game.opponent);
              const artSrc = game.preview_image_url || getOpponentArt(game.opponent);
              const shortName = getShortOpponent(game.opponent);
              
              return (
                <Link key={game.id} to={`/matchup/${slug}`}>
                  <GlassCard
                    variant="interactive"
                    glow="blue"
                    delay={index * 0.08}
                    className="group aspect-video overflow-hidden"
                  >
                    <div className="relative w-full h-full">
                      <img 
                        src={artSrc} 
                        alt={`Mets vs ${game.opponent}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                      
                      {!isPremium && (
                        <PremiumBadge variant="corner" size="sm" noGlow />
                      )}
                      
                      {/* Home/Away badge */}
                      <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                        <span className={`text-[7px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded ${game.is_home_game ? 'bg-primary/90 text-primary-foreground' : 'bg-muted/90 text-foreground'}`}>
                          {game.is_home_game ? 'HOME' : 'AWAY'}
                        </span>
                      </div>
                      
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/30">
                          <Play className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 md:p-3">
                        <h3 className="text-[10px] sm:text-xs md:text-sm font-bold text-white mb-0.5 truncate drop-shadow-lg">
                          vs {shortName}
                        </h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[7px] sm:text-[9px] md:text-[10px] text-white/90 drop-shadow flex items-center gap-0.5">
                            <Calendar className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                            {formatGameDate(game.game_date)}
                          </span>
                          {game.game_time && (
                            <span className="text-[7px] sm:text-[9px] md:text-[10px] text-white/80 drop-shadow flex items-center gap-0.5">
                              <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                              {game.game_time}
                            </span>
                          )}
                        </div>
                        {game.location && (
                          <p className="text-[6px] sm:text-[8px] md:text-[9px] text-white/70 drop-shadow truncate flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-2 h-2 flex-shrink-0" />
                            {game.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        ) : (
          <GlassCard variant="default" glow="blue" className="p-6 text-center">
            <p className="text-muted-foreground">No spring training games scheduled yet.</p>
          </GlassCard>
        )}
        
        {displayGames.length > 0 && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              asChild
              size="sm"
              className="text-xs sm:text-sm glass-card border-border/30 hover:border-primary/50"
            >
              <Link to="/spring-training-live">
                See Matchup Overview
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
