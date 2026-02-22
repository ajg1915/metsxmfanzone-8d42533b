import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface GameData {
  gamePk: number;
  gameDate: string;
  status: { abstractGameState: string; detailedState: string; statusCode: string };
  teams: {
    away: { team: { id: number; name: string }; score?: number };
    home: { team: { id: number; name: string }; score?: number };
  };
  linescore?: {
    currentInning?: number;
    currentInningOrdinal?: string;
    inningState?: string;
    innings?: Array<{ num: number; home?: { runs?: number }; away?: { runs?: number } }>;
    offense?: { batter?: { id: number; fullName: string }; onDeck?: { id: number; fullName: string }; inHole?: { id: number; fullName: string }; first?: boolean; second?: boolean; third?: boolean };
    defense?: { pitcher?: { id: number; fullName: string } };
    balls?: number;
    strikes?: number;
    outs?: number;
  };
  venue?: { name: string };
}

function BaseDiamond({ offense }: { offense?: GameData['linescore']['offense'] }) {
  return (
    <div className="relative w-14 h-14 sm:w-16 sm:h-16">
      <div className={`absolute top-0.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 border-2 transition-colors ${offense?.second ? 'bg-yellow-400 border-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'bg-muted/50 border-muted-foreground/20'}`} />
      <div className={`absolute top-1/2 left-0.5 -translate-y-1/2 w-3.5 h-3.5 rotate-45 border-2 transition-colors ${offense?.third ? 'bg-yellow-400 border-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'bg-muted/50 border-muted-foreground/20'}`} />
      <div className={`absolute top-1/2 right-0.5 -translate-y-1/2 w-3.5 h-3.5 rotate-45 border-2 transition-colors ${offense?.first ? 'bg-yellow-400 border-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'bg-muted/50 border-muted-foreground/20'}`} />
      {/* Home plate */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-white/80 border border-white/40" />
    </div>
  );
}

function CountDisplay({ balls, strikes, outs }: { balls: number; strikes: number; outs: number }) {
  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground font-mono w-3">B</span>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i < balls ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.4)]' : 'bg-muted/40'}`} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground font-mono w-3">S</span>
        <div className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i < strikes ? 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.4)]' : 'bg-muted/40'}`} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground font-mono w-3">O</span>
        <div className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i < outs ? 'bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.4)]' : 'bg-muted/40'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GamecastScoreboard({ gameData }: { gameData: GameData }) {
  const isLive = gameData.status.abstractGameState === 'Live';
  const isFinal = gameData.status.abstractGameState === 'Final';

  return (
    <Card className={`border-2 overflow-hidden ${isLive ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : isFinal ? 'border-muted-foreground/20' : 'border-primary/20'}`}>
      {/* Status bar */}
      <div className={`px-3 py-1.5 flex items-center justify-between text-xs ${isLive ? 'bg-red-500/20' : isFinal ? 'bg-muted/30' : 'bg-primary/10'}`}>
        <div className="flex items-center gap-2">
          <Badge variant={isLive ? 'destructive' : 'secondary'} className="text-[10px] px-2 py-0">
            {isLive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1" />}
            {gameData.status.detailedState}
          </Badge>
          {gameData.linescore?.currentInningOrdinal && (
            <span className="font-bold text-sm">
              {gameData.linescore.inningState} {gameData.linescore.currentInningOrdinal}
            </span>
          )}
        </div>
        <span className="text-muted-foreground">{gameData.venue?.name}</span>
      </div>

      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 items-center">
          {/* Away Team */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={`https://www.mlbstatic.com/team-logos/${gameData.teams.away.team.id}.svg`} alt={gameData.teams.away.team.name} className="w-10 h-10 sm:w-14 sm:h-14" />
            <div>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate max-w-[70px] sm:max-w-none">{gameData.teams.away.team.name}</div>
              <div className="text-2xl sm:text-4xl font-black tabular-nums">{gameData.teams.away.score ?? 0}</div>
            </div>
          </div>

          {/* Center - Count/Bases */}
          <div className="flex flex-col items-center gap-1">
            <BaseDiamond offense={gameData.linescore?.offense} />
            {isLive && (
              <CountDisplay
                balls={gameData.linescore?.balls || 0}
                strikes={gameData.linescore?.strikes || 0}
                outs={gameData.linescore?.outs || 0}
              />
            )}
          </div>

          {/* Home Team */}
          <div className="flex items-center gap-2 sm:gap-3 justify-end">
            <div className="text-right">
              <div className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate max-w-[70px] sm:max-w-none">{gameData.teams.home.team.name}</div>
              <div className="text-2xl sm:text-4xl font-black tabular-nums">{gameData.teams.home.score ?? 0}</div>
            </div>
            <div className="flex flex-col items-center">
              <img src={`https://www.mlbstatic.com/team-logos/${gameData.teams.home.team.id}.svg`} alt={gameData.teams.home.team.name} className="w-10 h-10 sm:w-14 sm:h-14" />
              {gameData.teams.home.team.id === 121 && (
                <Link to="/metsxmfanzone-tv" className="text-[10px] sm:text-xs font-bold text-primary hover:text-primary/80 mt-0.5 animate-pulse">
                  WATCH Live
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* At Bat Info */}
        {isLive && (
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
            <div className="text-center bg-muted/20 rounded-lg p-2">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">At Bat</div>
              <div className="text-xs sm:text-sm font-bold truncate">{gameData.linescore?.offense?.batter?.fullName || 'TBD'}</div>
            </div>
            <div className="text-center bg-muted/20 rounded-lg p-2">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Pitching</div>
              <div className="text-xs sm:text-sm font-bold truncate">{gameData.linescore?.defense?.pitcher?.fullName || 'TBD'}</div>
            </div>
            <div className="text-center bg-muted/20 rounded-lg p-2">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">On Deck</div>
              <div className="text-xs sm:text-sm font-bold truncate">{gameData.linescore?.offense?.onDeck?.fullName || 'TBD'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
