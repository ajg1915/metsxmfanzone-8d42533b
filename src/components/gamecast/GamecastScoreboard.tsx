import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Radio, Tv } from "lucide-react";

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
  const baseClass = (active?: boolean) =>
    `w-4 h-4 sm:w-[18px] sm:h-[18px] rotate-45 border-2 transition-all duration-300 ${
      active
        ? 'bg-primary border-primary shadow-[0_0_12px_hsl(16_100%_50%/0.6)]'
        : 'bg-muted/30 border-muted-foreground/15'
    }`;

  return (
    <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px]">
      <div className={`absolute top-0.5 left-1/2 -translate-x-1/2 ${baseClass(offense?.second)}`} />
      <div className={`absolute top-1/2 left-1 -translate-y-1/2 ${baseClass(offense?.third)}`} />
      <div className={`absolute top-1/2 right-1 -translate-y-1/2 ${baseClass(offense?.first)}`} />
      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-foreground/60 border border-foreground/30" />
    </div>
  );
}

function CountDot({ active, color }: { active: boolean; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-500 shadow-[0_0_6px_hsl(142_71%_45%/0.5)]',
    red: 'bg-red-500 shadow-[0_0_6px_hsl(0_84%_60%/0.5)]',
    orange: 'bg-primary shadow-[0_0_6px_hsl(16_100%_50%/0.5)]',
  };
  return (
    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${active ? colorMap[color] : 'bg-muted-foreground/15'}`} />
  );
}

function CountDisplay({ balls, strikes, outs }: { balls: number; strikes: number; outs: number }) {
  return (
    <div className="flex flex-col gap-1.5 text-[10px]">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground font-mono w-3 font-bold">B</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map(i => <CountDot key={i} active={i < balls} color="green" />)}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground font-mono w-3 font-bold">S</span>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => <CountDot key={i} active={i < strikes} color="red" />)}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground font-mono w-3 font-bold">O</span>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => <CountDot key={i} active={i < outs} color="orange" />)}
        </div>
      </div>
    </div>
  );
}

function TeamBlock({ team, side, isMets }: { team: GameData['teams']['away']; side: 'away' | 'home'; isMets: boolean }) {
  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${side === 'home' ? 'flex-row-reverse' : ''}`}>
      <div className="relative">
        <img
          src={`https://www.mlbstatic.com/team-logos/${team.team.id}.svg`}
          alt={team.team.name}
          className="w-14 h-14 sm:w-[72px] sm:h-[72px] drop-shadow-lg"
        />
        {isMets && (
          <Link
            to="/metsxmfanzone-tv"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-[9px] font-bold text-primary hover:text-primary/80 bg-primary/10 border border-primary/20 rounded-full px-1.5 py-0.5 whitespace-nowrap"
          >
            <Tv className="w-2.5 h-2.5" />
            WATCH
          </Link>
        )}
      </div>
      <div className={`${side === 'home' ? 'text-right' : ''}`}>
        <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider truncate max-w-[90px] sm:max-w-none">
          {team.team.name}
        </div>
        <div className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight leading-none mt-0.5">
          {team.score ?? 0}
        </div>
      </div>
    </div>
  );
}

export default function GamecastScoreboard({ gameData }: { gameData: GameData }) {
  const isLive = gameData.status.abstractGameState === 'Live';
  const isFinal = gameData.status.abstractGameState === 'Final';
  const metsAreHome = gameData.teams.home.team.id === 121;

  return (
    <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
      isLive ? 'glass-card glow-blue-pulse' : 'glass-card'
    }`}>
      {/* Top gradient accent */}
      <div className={`h-1 w-full ${isLive ? 'bg-gradient-to-r from-red-500 via-primary to-red-500 animate-pulse' : isFinal ? 'bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/10' : 'bg-gradient-to-r from-secondary via-primary to-secondary'}`} />

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/10">
        <div className="flex items-center gap-2">
          {isLive ? (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-2 py-0.5 gap-1 font-bold">
              <Radio className="w-3 h-3 animate-pulse" />
              LIVE
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-bold">
              {gameData.status.detailedState}
            </Badge>
          )}
          {gameData.linescore?.currentInningOrdinal && (
            <span className="text-sm font-black text-foreground">
              {gameData.linescore.inningState} {gameData.linescore.currentInningOrdinal}
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">{gameData.venue?.name}</span>
      </div>

      {/* Scoreboard Body */}
      <div className="px-4 sm:px-6 py-5 sm:py-6">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-6 items-center">
          <TeamBlock team={gameData.teams.away} side="away" isMets={!metsAreHome} />

          {/* Center Diamond + Count */}
          <div className="flex flex-col items-center gap-2">
            <BaseDiamond offense={gameData.linescore?.offense} />
            {isLive && (
              <CountDisplay
                balls={gameData.linescore?.balls || 0}
                strikes={gameData.linescore?.strikes || 0}
                outs={gameData.linescore?.outs || 0}
              />
            )}
            {!isLive && !isFinal && (
              <span className="text-[10px] text-muted-foreground font-mono mt-1">VS</span>
            )}
          </div>

          <TeamBlock team={gameData.teams.home} side="home" isMets={metsAreHome} />
        </div>

        {/* At Bat Strip */}
        {isLive && (
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-border/10">
            {[
              { label: 'At Bat', name: gameData.linescore?.offense?.batter?.fullName },
              { label: 'Pitching', name: gameData.linescore?.defense?.pitcher?.fullName },
              { label: 'On Deck', name: gameData.linescore?.offense?.onDeck?.fullName },
            ].map(({ label, name }) => (
              <div key={label} className="text-center rounded-xl bg-muted/15 border border-border/10 p-2.5">
                <div className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-bold mb-0.5">{label}</div>
                <div className="text-[11px] sm:text-xs font-bold truncate text-foreground">{name || 'TBD'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
