import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import metsLogo from "@/assets/metsxmfanzone-logo.png";

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
    <div className="px-3 sm:px-4 md:px-6 my-3 sm:my-4">
      <Link to="/mets-gamecast" className="block group">
        <Card className={`overflow-hidden border-2 transition-all duration-300 group-hover:scale-[1.01] group-hover:shadow-lg ${
          isLive
            ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] bg-gradient-to-r from-red-500/5 via-background to-red-500/5'
            : 'border-primary/30 bg-gradient-to-r from-primary/5 via-background to-primary/5 group-hover:border-primary/50'
        }`}>
          <CardContent className="p-0">
            <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
              {/* Icon */}
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={metsLogo} alt="MetsXMFanZone" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              </div>

              {/* Game info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs sm:text-sm font-bold">Mets Gamecast</span>
                  {isLive && (
                    <Badge variant="destructive" className="text-[9px] px-1.5 py-0 animate-pulse">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1" />
                      LIVE
                    </Badge>
                  )}
                  {isFinal && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">FINAL</Badge>
                  )}
                </div>

                {hasGame ? (
                  <div className="flex items-center gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5">
                      <img src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} alt="" className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="font-medium truncate max-w-[60px] sm:max-w-none">{game.teams.away.team.name.split(' ').pop()}</span>
                      {(isLive || isFinal) && <span className="font-black text-sm sm:text-base">{game.teams.away.score ?? 0}</span>}
                    </div>
                    <span className="text-muted-foreground text-xs">@</span>
                    <div className="flex items-center gap-1.5">
                      <img src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} alt="" className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="font-medium truncate max-w-[60px] sm:max-w-none">{game.teams.home.team.name.split(' ').pop()}</span>
                      {(isLive || isFinal) && <span className="font-black text-sm sm:text-base">{game.teams.home.score ?? 0}</span>}
                    </div>
                    {isLive && game.linescore?.currentInningOrdinal && (
                      <span className="text-red-400 text-[10px] font-semibold ml-auto">
                        {game.linescore.inningState} {game.linescore.currentInningOrdinal}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Live scores, play-by-play & box scores</p>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
