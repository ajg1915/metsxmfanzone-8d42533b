import { useState } from "react";
import { Flame, Snowflake, CheckCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";

interface Player {
  player_name: string;
  player_image_url: string | null;
  is_pitcher: boolean;
  player_id: number | null;
  status: string;
  id: string;
}

interface ActiveRosterSectionProps {
  players: Player[];
  parlaySlip: string[];
  onTogglePlayer: (id: string) => void;
}

const ActiveRosterSection = ({ players, parlaySlip, onTogglePlayer }: ActiveRosterSectionProps) => {
  const [search, setSearch] = useState("");
  const [rosterFilter, setRosterFilter] = useState<"all" | "hitters" | "pitchers">("all");

  const uniquePlayers = players.reduce<Player[]>((acc, p) => {
    if (!acc.find((x) => x.player_name === p.player_name)) acc.push(p);
    return acc;
  }, []);

  const filtered = uniquePlayers.filter((p) => {
    const matchesSearch = p.player_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      rosterFilter === "all" ||
      (rosterFilter === "hitters" && !p.is_pitcher) ||
      (rosterFilter === "pitchers" && p.is_pitcher);
    return matchesSearch && matchesFilter;
  });

  return (
    <section className="mt-12">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-white">Active Roster</h2>
        <Badge variant="outline" className="text-xs border-primary/50 text-primary">
          {uniquePlayers.length} Players
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Browse the full 2026 Mets roster. Tap a player to add them to your parlay slip.
      </p>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card/80 border-border/50 text-sm max-w-xs"
        />
        <div className="flex gap-2">
          {(["all", "hitters", "pitchers"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setRosterFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                rosterFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/60 text-muted-foreground hover:bg-card"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((player) => {
          const isInSlip = parlaySlip.includes(player.id);
          return (
            <motion.div
              key={player.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTogglePlayer(player.id)}
              className={`relative bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:shadow-lg ${
                isInSlip
                  ? "border-green-500 shadow-green-500/20"
                  : "border-border/30 hover:border-primary/50"
              }`}
            >
              {/* Player Image */}
              <div className="relative w-full aspect-square bg-gradient-to-b from-background to-card flex items-center justify-center overflow-hidden">
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
                  <span className="text-3xl font-bold text-primary">
                    {player.player_name.charAt(0)}
                  </span>
                )}

                {/* Selection indicator */}
                {isInSlip && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-green-500 drop-shadow" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5 text-center">
                <h4 className="font-semibold text-white text-xs sm:text-sm truncate">
                  {player.player_name}
                </h4>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1.5 py-0 border-muted-foreground/30"
                  >
                    {player.is_pitcher ? "P" : "POS"}
                  </Badge>
                  {player.status === "hot" ? (
                    <Flame className="w-3 h-3 text-orange-500" />
                  ) : (
                    <Snowflake className="w-3 h-3 text-blue-400" />
                  )}
                </div>
              </div>

              {/* Bottom strip */}
              <div
                className={`h-1 w-full ${
                  isInSlip
                    ? "bg-green-500"
                    : "bg-gradient-to-r from-primary/50 to-primary/20"
                }`}
              />
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="p-8 text-center">
          <p className="text-muted-foreground text-sm">No players match your search.</p>
        </GlassCard>
      )}
    </section>
  );
};

export default ActiveRosterSection;
