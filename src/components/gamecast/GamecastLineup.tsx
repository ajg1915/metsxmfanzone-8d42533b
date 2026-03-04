import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTeamAbbreviation } from "./GamecastTicker";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface GamecastLineupProps {
  gameData: {
    teams: {
      away: { team: { id: number; name: string } };
      home: { team: { id: number; name: string } };
    };
  };
  boxScore: any;
}

function TeamLineup({ boxScore, side }: { boxScore: any; side: 'away' | 'home' }) {
  const teamData = boxScore?.teams?.[side];
  const battingOrder = teamData?.battingOrder || [];
  const players = teamData?.players || {};
  const bullpen = teamData?.bullpen || [];
  const pitchers = teamData?.pitchers || [];

  if (!teamData || battingOrder.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8 text-xs">
        Lineup available once the game starts
      </div>
    );
  }

  const currentPitcherId = pitchers.length > 0 ? pitchers[pitchers.length - 1] : null;
  const currentPitcher = currentPitcherId ? players[`ID${currentPitcherId}`] : null;

  return (
    <div className="space-y-5">
      {/* Current Pitcher */}
      {currentPitcher && (
        <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary mb-2">Pitching</div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-secondary/15 border border-secondary/25 flex items-center justify-center text-[10px] font-black text-secondary">
              P
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs truncate">{currentPitcher.person?.fullName}</div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {currentPitcher.stats?.pitching?.inningsPitched || '0'} IP · {currentPitcher.stats?.pitching?.strikeOuts || 0} K · {currentPitcher.stats?.pitching?.hits || 0} H
              </div>
            </div>
            {currentPitcher.stats?.pitching?.era && (
              <span className="text-[10px] font-mono font-bold text-secondary">{currentPitcher.stats.pitching.era} ERA</span>
            )}
          </div>
        </div>
      )}

      {/* Batting Order */}
      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Batting Order</div>
        <div className="space-y-0.5">
          {battingOrder.map((playerId: number, idx: number) => {
            const player = players[`ID${playerId}`];
            if (!player) return null;
            const stats = player.stats?.batting;
            const isCurrentBatter = player.gameStatus?.isCurrentBatter;
            const isSubstitute = player.gameStatus?.isSubstitute;

            return (
              <div
                key={playerId}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all ${
                  isCurrentBatter ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/10'
                }`}
              >
                <span className="w-5 text-center text-muted-foreground/50 font-mono text-[10px] font-bold">{idx + 1}</span>
                <span className="w-7 text-center text-[10px] font-bold text-muted-foreground/60">{player.position?.abbreviation}</span>
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <span className={`font-semibold truncate ${isCurrentBatter ? 'text-primary' : ''}`}>
                    {player.person?.fullName}
                  </span>
                  {isCurrentBatter && (
                    <Badge className="text-[7px] px-1 py-0 h-3.5 bg-primary/20 text-primary border-primary/30 animate-pulse font-black">AB</Badge>
                  )}
                  {isSubstitute && (
                    <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5 text-primary border-primary/25 font-bold">SUB</Badge>
                  )}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground/60 w-12 text-right font-bold">
                  {stats ? `${stats.hits || 0}-${stats.atBats || 0}` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bench */}
      {teamData.bench && teamData.bench.length > 0 && (
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Bench</div>
          <div className="space-y-0.5">
            {teamData.bench.map((playerId: number) => {
              const player = players[`ID${playerId}`];
              if (!player) return null;
              return (
                <div key={playerId} className="flex items-center gap-2 p-1.5 text-xs text-muted-foreground/60">
                  <span className="w-5" />
                  <span className="w-7 text-center text-[10px]">{player.position?.abbreviation}</span>
                  <span className="flex-1 truncate">{player.person?.fullName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bullpen */}
      {bullpen.length > 0 && (
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Bullpen</div>
          <div className="space-y-0.5">
            {bullpen.map((playerId: number) => {
              const player = players[`ID${playerId}`];
              if (!player) return null;
              const hasThrown = player.stats?.pitching?.inningsPitched;
              return (
                <div key={playerId} className={`flex items-center gap-2 p-1.5 text-xs ${hasThrown ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                  <span className="w-5" />
                  <span className="w-7 text-center text-[10px] font-bold">P</span>
                  <span className="flex-1 truncate">{player.person?.fullName}</span>
                  {hasThrown && (
                    <span className="text-[10px] font-mono font-bold">{player.stats.pitching.inningsPitched} IP</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GamecastLineup({ gameData, boxScore }: GamecastLineupProps) {
  const metsAreHome = gameData.teams.home.team.id === 121;
  const defaultTab = metsAreHome ? 'home' : 'away';
  const [activeTab, setActiveTab] = useState<'away' | 'home'>(defaultTab as 'away' | 'home');

  return (
    <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'away' | 'home')}>
      <TabsList className="w-full mb-3 bg-muted/15 border border-border/10">
        <TabsTrigger value="away" className="flex-1 text-xs gap-1.5 font-bold">
          <img src={`https://www.mlbstatic.com/team-logos/${gameData.teams.away.team.id}.svg`} alt="" className="w-4 h-4" />
          {getTeamAbbreviation(gameData.teams.away.team.name)}
        </TabsTrigger>
        <TabsTrigger value="home" className="flex-1 text-xs gap-1.5 font-bold">
          <img src={`https://www.mlbstatic.com/team-logos/${gameData.teams.home.team.id}.svg`} alt="" className="w-4 h-4" />
          {getTeamAbbreviation(gameData.teams.home.team.name)}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="away">
        <TeamLineup boxScore={boxScore} side="away" />
      </TabsContent>
      <TabsContent value="home">
        <TeamLineup boxScore={boxScore} side="home" />
      </TabsContent>
    </Tabs>
  );
}
