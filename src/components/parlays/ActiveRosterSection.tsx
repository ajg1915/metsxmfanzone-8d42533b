import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Users, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";

const METS_TEAM_ID = 121;

interface RosterPlayer {
  id: number;
  fullName: string;
  jerseyNumber: string;
  position: string;
  positionType: string;
  imageUrl: string;
}

interface ActiveRosterSectionProps {
  parlaySlip: string[];
  onTogglePlayer: (id: string) => void;
}

const ActiveRosterSection = ({ parlaySlip, onTogglePlayer }: ActiveRosterSectionProps) => {
  const [search, setSearch] = useState("");
  const [rosterFilter, setRosterFilter] = useState<"all" | "hitters" | "pitchers">("all");

  const { data: roster, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["mets-active-roster-parlays"],
    queryFn: async () => {
      const response = await fetch(
        `https://statsapi.mlb.com/api/v1/teams/${METS_TEAM_ID}/roster?rosterType=active&season=2026`
      );
      if (!response.ok) throw new Error("Failed to fetch roster");
      const data = await response.json();

      const players: RosterPlayer[] = (data.roster || []).map((entry: any) => ({
        id: entry.person.id,
        fullName: entry.person.fullName,
        jerseyNumber: entry.jerseyNumber || "—",
        position: entry.position?.abbreviation || entry.position?.name || "UTIL",
        positionType: entry.position?.type || "Unknown",
        imageUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${entry.person.id}/headshot/67/current`,
      }));

      return players.sort((a, b) => {
        const numA = parseInt(a.jerseyNumber) || 999;
        const numB = parseInt(b.jerseyNumber) || 999;
        return numA - numB;
      });
    },
    staleTime: 1000 * 60 * 10,
  });

  const filtered = (roster || []).filter((p) => {
    const matchesSearch = p.fullName.toLowerCase().includes(search.toLowerCase());
    const isPitcher = p.positionType === "Pitcher";
    const matchesFilter =
      rosterFilter === "all" ||
      (rosterFilter === "pitchers" && isPitcher) ||
      (rosterFilter === "hitters" && !isPitcher);
    return matchesSearch && matchesFilter;
  });

  const getPositionColor = (type: string) => {
    switch (type) {
      case "Pitcher": return "border-blue-500/30 text-blue-400 bg-blue-500/10";
      case "Catcher": return "border-purple-500/30 text-purple-400 bg-purple-500/10";
      case "Infielder": return "border-green-500/30 text-green-400 bg-green-500/10";
      case "Outfielder": return "border-orange-500/30 text-orange-400 bg-orange-500/10";
      default: return "border-muted text-muted-foreground bg-muted/20";
    }
  };

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-white">Active 26-Man Roster</h2>
          {roster && (
            <Badge variant="outline" className="text-xs border-primary/50 text-primary">
              {roster.length} Players
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="text-xs gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Live 2026 Mets 26-man roster from MLB. Tap a player to add them to your parlay slip.
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

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-card/50 rounded-xl border border-border/30 overflow-hidden">
              <Skeleton className="w-full aspect-square" />
              <div className="p-2.5 space-y-2">
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-3 w-1/2 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Player Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((player) => {
            const rosterPlayerId = `roster-${player.id}`;
            const isInSlip = parlaySlip.includes(rosterPlayerId);
            return (
              <motion.div
                key={player.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTogglePlayer(rosterPlayerId)}
                className={`relative bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:shadow-lg ${
                  isInSlip
                    ? "border-green-500 shadow-green-500/20"
                    : "border-border/30 hover:border-primary/50"
                }`}
              >
                {/* Player Image */}
                <div className="relative w-full aspect-square bg-gradient-to-b from-background to-card flex items-center justify-center overflow-hidden">
                  <img
                    src={player.imageUrl}
                    alt={player.fullName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />

                  {/* Jersey number */}
                  <div className="absolute bottom-1 left-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary-foreground">
                      {player.jerseyNumber}
                    </span>
                  </div>

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
                    {player.fullName}
                  </h4>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 ${getPositionColor(player.positionType)}`}
                    >
                      {player.position}
                    </Badge>
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
      )}

      {!isLoading && filtered.length === 0 && (
        <GlassCard className="p-8 text-center">
          <p className="text-muted-foreground text-sm">No players match your search.</p>
        </GlassCard>
      )}
    </section>
  );
};

export default ActiveRosterSection;
