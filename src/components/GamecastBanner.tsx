import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Radio, ChevronRight, Activity } from "lucide-react";

interface LiveGame {
  gamePk: number;
  status: { abstractGameState: string; detailedState: string };
  teams: {
    away: { team: { id: number; name: string }; score?: number };
    home: { team: { id: number; name: string }; score?: number };
  };
  linescore?: {
    currentInningOrdinal?: string;
    inningState?: string;
  };
  venue?: { name: string };
}

export default function GamecastBanner() {
  const [game, setGame] = useState<LiveGame | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=121&date=${today}&hydrate=linescore,team,venue`);
        const data = await res.json();
        if (data.dates?.[0]?.games?.[0]) {
          setGame(data.dates[0].games[0]);
        }
      } catch {
        // silent fail
      }
    };
    fetchGame();
    const interval = setInterval(fetchGame, 60000);
    return () => clearInterval(interval);
  }, []);

  const isLive = game?.status.abstractGameState === 'Live';
  const isFinal = game?.status.abstractGameState === 'Final';
  const hasGame = !!game;

  return (
    <div className="px-3 sm:px-4 md:px-6 mt-6 sm:mt-8 mb-6 sm:mb-8">
      <Link to="/mets-gamecast" className="block group">
        <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.01] ${
          isLive
            ? 'glass-card shadow-[0_0_30px_hsl(var(--destructive)/0.15)]'
            : 'glass-card'
        }`}>
          {/* Top accent bar */}
          <div className={`h-1 w-full ${
            isLive
              ? 'bg-gradient-to-r from-destructive via-primary to-destructive animate-pulse'
              : isFinal
              ? 'bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/10'
              : 'bg-gradient-to-r from-secondary via-primary to-secondary'
          }`} />

          {/* Background glow effects */}
          {isLive && (
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 via-transparent to-destructive/5 pointer-events-none" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

          <div className="relative flex items-center gap-3 sm:gap-5 p-4 sm:p-5">
            {/* Left icon block */}
            <div className="shrink-0 relative">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                isLive
                  ? 'bg-destructive/10 border-destructive/30'
                  : 'bg-primary/10 border-primary/20'
              }`}>
                <Activity className={`w-6 h-6 sm:w-7 sm:h-7 ${isLive ? 'text-destructive' : 'text-primary'}`} />
              </div>
              {isLive && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-destructive border-2 border-background" />
                </span>
              )}
            </div>

            {/* Game info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-foreground">Game Center</span>
                {isLive && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-full px-2 py-0.5">
                    <Radio className="w-3 h-3 animate-pulse" />
                    LIVE
                  </span>
                )}
                {isFinal && (
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted/30 border border-border/20 rounded-full px-2 py-0.5">
                    FINAL
                  </span>
                )}
              </div>

              {hasGame ? (
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Away team */}
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`}
                      alt={game.teams.away.team.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-md"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide leading-tight truncate max-w-[60px] sm:max-w-none">
                        {game.teams.away.team.name.split(' ').pop()}
                      </span>
                      {(isLive || isFinal) && (
                        <span className="text-lg sm:text-xl font-black tabular-nums leading-tight">{game.teams.away.score ?? 0}</span>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex flex-col items-center px-1">
                    {isLive && game.linescore?.currentInningOrdinal ? (
                      <span className="text-[9px] font-bold text-destructive whitespace-nowrap">
                        {game.linescore.inningState} {game.linescore.currentInningOrdinal}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50 font-mono">VS</span>
                    )}
                  </div>

                  {/* Home team */}
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`}
                      alt={game.teams.home.team.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-md"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide leading-tight truncate max-w-[60px] sm:max-w-none">
                        {game.teams.home.team.name.split(' ').pop()}
                      </span>
                      {(isLive || isFinal) && (
                        <span className="text-lg sm:text-xl font-black tabular-nums leading-tight">{game.teams.home.score ?? 0}</span>
                      )}
                    </div>
                  </div>

                  {/* Venue tag */}
                  {game.venue?.name && (
                    <span className="hidden sm:block ml-auto text-[9px] text-muted-foreground/60 font-medium">
                      {game.venue.name}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Live scores, play-by-play & box scores</p>
              )}
            </div>

            {/* Arrow */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
              <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
