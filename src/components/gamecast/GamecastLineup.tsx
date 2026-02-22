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
      <div className="text-center text-muted-foreground py-6 text-xs">
        Lineup available once the game starts
      </div>
    );
  }

  // Get current pitcher from the pitchers array (last one is current)
  const currentPitcherId = pitchers.length > 0 ? pitchers[pitchers.length - 1] : null;
  const currentPitcher = currentPitcherId ? players[`ID${currentPitcherId}`] : null;

  return (
    <div className="space-y-4">
      {/* Current Pitcher */}
      {currentPitcher && (
        <div className="rounded-lg border border-border/30 bg-muted/10 p-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Pitching
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
              P
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs truncate">{currentPitcher.person?.fullName}</div>
              <div className="text-[10px] text-muted-foreground">
                {currentPitcher.stats?.pitching?.inningsPitched || '0'} IP · {currentPitcher.stats?.pitching?.strikeOuts || 0} K · {currentPitcher.stats?.pitching?.hits || 0} H
              </div>
            </div>
            {currentPitcher.stats?.pitching?.era && (
              <span className="text-[10px] font-mono text-muted-foreground">{currentPitcher.stats.pitching.era} ERA</span>
            )}
          </div>
        </div>
      )}

      {/* Batting Order */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          Batting Order
        </div>
        <div className="space-y-0.5">
          {battingOrder.map((playerId: number, idx: number) => {
            const player = players[`ID${playerId}`];
            if (!player) return null;
            const stats = player.stats?.batting;
            const isSubstitute = player.gameStatus?.isSubstitute;
            const isCurrentBatter = player.gameStatus?.isCurrentBatter;

            return (
              <div
                key={playerId}
                className={`flex items-center gap-2 p-1.5 rounded-md text-xs transition-colors ${
                  isCurrentBatter ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/10'
                }`}
              >
                <span className="w-4 text-center text-muted-foreground font-mono text-[10px]">{idx + 1}</span>
                <span className="w-7 text-center text-[10px] font-semibold text-muted-foreground/70">{player.position?.abbreviation}</span>
                <div className="flex-1 min-w-0 flex items-center gap-1">
                  <span className={`font-medium truncate ${isCurrentBatter ? 'text-primary' : ''}`}>
                    {player.person?.fullName}
                  </span>
                  {isCurrentBatter && (
                    <Badge variant="default" className="text-[8px] px-1 py-0 h-3.5 animate-pulse">AB</Badge>
                  )}
                  {isSubstitute && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 text-yellow-400 border-yellow-400/30">SUB</Badge>
                  )}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground w-12 text-right">
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
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Bench</div>
          <div className="space-y-0.5">
            {teamData.bench.map((playerId: number) => {
              const player = players[`ID${playerId}`];
              if (!player) return null;
              return (
                <div key={playerId} className="flex items-center gap-2 p-1.5 text-xs text-muted-foreground">
                  <span className="w-4" />
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
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Bullpen</div>
          <div className="space-y-0.5">
            {bullpen.map((playerId: number) => {
              const player = players[`ID${playerId}`];
              if (!player) return null;
              const hasThrown = player.stats?.pitching?.inningsPitched;
              return (
                <div key={playerId} className={`flex items-center gap-2 p-1.5 text-xs ${hasThrown ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <span className="w-4" />
                  <span className="w-7 text-center text-[10px]">P</span>
                  <span className="flex-1 truncate">{player.person?.fullName}</span>
                  {hasThrown && (
                    <span className="text-[10px] font-mono">{player.stats.pitching.inningsPitched} IP</span>
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
  const [activeTab, setActiveTab] = useState<'away' | 'home'>('home');

  // Default to Mets side
  const metsAreHome = gameData.teams.home.team.id === 121;
  const defaultTab = metsAreHome ? 'home' : 'away';

  return (
    <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={v => setActiveTab(v as 'away' | 'home')}>
      <TabsList className="w-full mb-3">
        <TabsTrigger value="away" className="flex-1 text-xs gap-1">
          <img src={`https://www.mlbstatic.com/team-logos/${gameData.teams.away.team.id}.svg`} alt="" className="w-4 h-4" />
          {getTeamAbbreviation(gameData.teams.away.team.name)}
        </TabsTrigger>
        <TabsTrigger value="home" className="flex-1 text-xs gap-1">
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
