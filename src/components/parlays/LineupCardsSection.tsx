import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, Calendar, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/GlassCard";
import { Json } from "@/integrations/supabase/types";

interface LineupPlayer {
  name: string;
  position: string;
  batting_order: number;
}

interface StartingPitcher {
  name: string;
  throws?: string;
  stats?: string;
}

const LineupCardsSection = () => {
  const { data: lineupCards, isLoading } = useQuery({
    queryKey: ["lineup-cards-parlays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lineup_cards")
        .select("*")
        .eq("published", true)
        .order("game_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const parseLineupData = (data: Json): LineupPlayer[] => {
    if (!Array.isArray(data)) return [];
    return data as unknown as LineupPlayer[];
  };

  const parsePitcher = (data: Json | null): StartingPitcher | null => {
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    return data as unknown as StartingPitcher;
  };

  const today = new Date().toISOString().split("T")[0];

  const currentCards = lineupCards?.filter((c) => c.game_date.startsWith(today)) || [];
  const previousCards = lineupCards?.filter((c) => !c.game_date.startsWith(today)) || [];

  return (
    <section className="mt-12">
      <div className="flex items-center gap-3 mb-4">
        <ClipboardList className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-white">Lineup Cards</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        View today's starting lineup and recent game lineups to inform your parlay picks.
      </p>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-card/50 rounded-xl animate-pulse border border-border/30" />
          ))}
        </div>
      )}

      {!isLoading && (!lineupCards || lineupCards.length === 0) && (
        <GlassCard glow="blue" className="p-10 text-center">
          <ClipboardList className="w-12 h-12 text-primary/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Lineup Cards Yet</h3>
          <p className="text-muted-foreground text-sm">
            Lineup cards will appear here once they're published for upcoming games.
          </p>
        </GlassCard>
      )}

      {/* Current Lineup */}
      {currentCards.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Today's Lineup
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCards.map((card) => (
              <LineupCardItem key={card.id} card={card} isCurrent parseLineupData={parseLineupData} parsePitcher={parsePitcher} />
            ))}
          </div>
        </div>
      )}

      {/* Previous Lineups */}
      {previousCards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Previous Lineups</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previousCards.map((card) => (
              <LineupCardItem key={card.id} card={card} isCurrent={false} parseLineupData={parseLineupData} parsePitcher={parsePitcher} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

interface LineupCardItemProps {
  card: {
    id: string;
    game_date: string;
    game_time: string;
    opponent: string;
    location: string | null;
    notes: string | null;
    lineup_data: Json;
    starting_pitcher: Json | null;
  };
  isCurrent: boolean;
  parseLineupData: (data: Json) => LineupPlayer[];
  parsePitcher: (data: Json | null) => StartingPitcher | null;
}

const LineupCardItem = ({ card, isCurrent, parseLineupData, parsePitcher }: LineupCardItemProps) => {
  const lineup = parseLineupData(card.lineup_data);
  const pitcher = parsePitcher(card.starting_pitcher);
  const gameDate = new Date(card.game_date);

  return (
    <div
      className={`bg-card/80 backdrop-blur-sm rounded-xl border-2 overflow-hidden transition-all ${
        isCurrent ? "border-green-500/50 shadow-green-500/10 shadow-lg" : "border-border/30"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-base">vs {card.opponent}</h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {gameDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {card.game_time}
              </span>
              {card.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {card.location}
                </span>
              )}
            </div>
          </div>
          {isCurrent && (
            <Badge className="bg-green-500/90 text-white text-[10px]">TODAY</Badge>
          )}
        </div>
      </div>

      {/* Batting Order */}
      <div className="p-4">
        {lineup.length > 0 ? (
          <div className="space-y-1.5">
            {lineup.map((player, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 text-sm py-1 px-2 rounded hover:bg-background/30 transition-colors"
              >
                <span className="text-primary font-bold w-5 text-center text-xs">
                  {player.batting_order || idx + 1}
                </span>
                <span className="text-white font-medium flex-1 truncate text-xs">
                  {player.name}
                </span>
                <span className="text-muted-foreground text-[10px] uppercase">
                  {player.position}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs text-center py-3">
            Lineup details not available
          </p>
        )}

        {/* Starting Pitcher */}
        {pitcher && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <div className="bg-primary/10 rounded-lg p-2.5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">SP</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{pitcher.name}</p>
                {pitcher.throws && (
                  <p className="text-muted-foreground text-[10px]">{pitcher.throws}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {card.notes && (
          <p className="text-muted-foreground text-[10px] mt-3 italic">{card.notes}</p>
        )}
      </div>
    </div>
  );
};

export default LineupCardsSection;
