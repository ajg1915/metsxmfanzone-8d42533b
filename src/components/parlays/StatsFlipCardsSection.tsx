import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, RefreshCw, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GlassCard from "@/components/GlassCard";
import metsLogo from "@/assets/metsxmfanzone-logo.png";

const METS_TEAM_ID = 121;

interface PlayerWithStats {
  id: number;
  fullName: string;
  jerseyNumber: string;
  position: string;
  positionType: string;
  imageUrl: string;
  current2026: Record<string, any> | null;
  previous2025: Record<string, any> | null;
  isPitcher: boolean;
}

const StatsFlipCardsSection = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "hitters" | "pitchers">("all");
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const { data: players, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["mets-stats-flip-cards-2026"],
    queryFn: async () => {
      // Fetch active roster
      const rosterRes = await fetch(
        `https://statsapi.mlb.com/api/v1/teams/${METS_TEAM_ID}/roster?rosterType=active&season=2026`
      );
      if (!rosterRes.ok) throw new Error("Failed to fetch roster");
      const rosterData = await rosterRes.json();
      const roster = rosterData.roster || [];

      // Fetch stats for each player (batch with Promise.allSettled)
      const playerPromises = roster.map(async (entry: any) => {
        const playerId = entry.person.id;
        const isPitcher = entry.position?.type === "Pitcher";
        const group = isPitcher ? "pitching" : "hitting";

        try {
          const statsRes = await fetch(
            `https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=yearByYear&group=${group}`
          );
          const statsData = await statsRes.json();
          const splits = statsData.stats?.[0]?.splits || [];

          // Filter for MLB only (sport.id === 1)
          const mlbSplits = splits.filter((s: any) => s.sport?.id === 1);

          const season2026 = mlbSplits.find((s: any) => s.season === "2026")?.stat || null;
          const season2025 = mlbSplits.find((s: any) => s.season === "2025")?.stat || null;

          return {
            id: playerId,
            fullName: entry.person.fullName,
            jerseyNumber: entry.jerseyNumber || "—",
            position: entry.position?.abbreviation || "UTIL",
            positionType: entry.position?.type || "Unknown",
            imageUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`,
            current2026: season2026,
            previous2025: season2025,
            isPitcher,
          } as PlayerWithStats;
        } catch {
          return {
            id: playerId,
            fullName: entry.person.fullName,
            jerseyNumber: entry.jerseyNumber || "—",
            position: entry.position?.abbreviation || "UTIL",
            positionType: entry.position?.type || "Unknown",
            imageUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`,
            current2026: null,
            previous2025: null,
            isPitcher,
          } as PlayerWithStats;
        }
      });

      const results = await Promise.allSettled(playerPromises);
      return results
        .filter((r): r is PromiseFulfilledResult<PlayerWithStats> => r.status === "fulfilled")
        .map((r) => r.value)
        .sort((a, b) => {
          const numA = parseInt(a.jerseyNumber) || 999;
          const numB = parseInt(b.jerseyNumber) || 999;
          return numA - numB;
        });
    },
    staleTime: 1000 * 60 * 15,
  });

  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = (players || []).filter((p) => {
    const matchesSearch = p.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "pitchers" && p.isPitcher) ||
      (filter === "hitters" && !p.isPitcher);
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
          <img src={metsLogo} alt="MetsXMFanZone" className="w-6 h-6 object-contain" />
          <h2 className="text-2xl font-bold text-white">Mets Player 2026 Stats</h2>
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
        Tap any card to flip and compare 2026 current stats vs 2025 previous season.
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
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card/50 rounded-xl border border-border/30 overflow-hidden">
              <Skeleton className="w-full h-48" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((player) => {
            const isFlipped = flippedCards[player.id] || false;

            return (
              <div
                key={player.id}
                className="perspective-1000 cursor-pointer"
                onClick={() => toggleFlip(player.id)}
              >
                <div
                  className="relative w-full transition-transform duration-500"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* FRONT: 2026 Current Stats */}
                  <div
                    className="relative bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-primary/40 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {/* Player Image */}
                    <div className="relative h-40 bg-gradient-to-b from-primary/10 to-card overflow-hidden flex items-center justify-center">
                      <img
                        src={player.imageUrl}
                        alt={player.fullName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5">
                          2026
                        </Badge>
                      </div>
                      <div className="absolute bottom-1 left-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground">
                          {player.jerseyNumber}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-bold text-white text-sm truncate mb-1">
                        {player.fullName}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 mb-2 ${getPositionColor(player.positionType)}`}
                      >
                        {player.position}
                      </Badge>

                      {/* 2026 Stats */}
                      {player.current2026 ? (
                        player.isPitcher ? (
                          <PitcherStatGrid stats={player.current2026} />
                        ) : (
                          <HitterStatGrid stats={player.current2026} />
                        )
                      ) : (
                        <div className="text-center py-3">
                          <p className="text-xs text-muted-foreground">No 2026 stats yet</p>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-primary">
                        <RotateCcw className="w-3 h-3" />
                        <span>Tap for 2025 stats</span>
                      </div>
                    </div>

                    <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
                  </div>

                  {/* BACK: 2025 Previous Stats */}
                  <div
                    className="absolute inset-0 bg-card/90 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-orange-500/40 hover:border-orange-500 transition-all"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {/* Player Image (smaller on back) */}
                    <div className="relative h-28 bg-gradient-to-b from-orange-500/10 to-card overflow-hidden flex items-center justify-center">
                      <img
                        src={player.imageUrl}
                        alt={player.fullName}
                        className="w-full h-full object-contain opacity-80"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-orange-500 text-white text-[10px] px-1.5">
                          2025
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-bold text-white text-sm truncate mb-1">
                        {player.fullName}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 mb-2 ${getPositionColor(player.positionType)}`}
                      >
                        {player.position} — Previous Season
                      </Badge>

                      {/* 2025 Stats */}
                      {player.previous2025 ? (
                        player.isPitcher ? (
                          <PitcherStatGrid stats={player.previous2025} />
                        ) : (
                          <HitterStatGrid stats={player.previous2025} />
                        )
                      ) : (
                        <div className="text-center py-3">
                          <p className="text-xs text-muted-foreground">No 2025 stats available</p>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-orange-400">
                        <RotateCcw className="w-3 h-3" />
                        <span>Tap for 2026 stats</span>
                      </div>
                    </div>

                    <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500" />
                  </div>
                </div>
              </div>
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

/* Hitter stat grid */
const HitterStatGrid = ({ stats }: { stats: Record<string, any> }) => (
  <div className="grid grid-cols-4 gap-1">
    <StatCell label="AVG" value={stats.avg || "—"} highlight />
    <StatCell label="HR" value={stats.homeRuns ?? "—"} />
    <StatCell label="RBI" value={stats.rbi ?? "—"} />
    <StatCell label="R" value={stats.runs ?? "—"} />
    <StatCell label="H" value={stats.hits ?? "—"} />
    <StatCell label="OBP" value={stats.obp || "—"} highlight />
    <StatCell label="SLG" value={stats.slg || "—"} highlight />
    <StatCell label="OPS" value={stats.ops || "—"} highlight />
  </div>
);

/* Pitcher stat grid */
const PitcherStatGrid = ({ stats }: { stats: Record<string, any> }) => (
  <div className="grid grid-cols-4 gap-1">
    <StatCell label="ERA" value={stats.era || "—"} highlight />
    <StatCell label="W" value={stats.wins ?? "—"} />
    <StatCell label="L" value={stats.losses ?? "—"} />
    <StatCell label="SV" value={stats.saves ?? "—"} />
    <StatCell label="K" value={stats.strikeOuts ?? "—"} />
    <StatCell label="IP" value={stats.inningsPitched || "—"} />
    <StatCell label="WHIP" value={stats.whip || "—"} highlight />
    <StatCell label="BB" value={stats.baseOnBalls ?? "—"} />
  </div>
);

/* Individual stat cell */
const StatCell = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) => (
  <div className="bg-background/60 rounded p-1.5 text-center">
    <div className={`text-sm font-bold ${highlight ? "text-primary" : "text-white"}`}>
      {value}
    </div>
    <div className="text-[8px] text-muted-foreground uppercase tracking-wider">{label}</div>
  </div>
);

export default StatsFlipCardsSection;
