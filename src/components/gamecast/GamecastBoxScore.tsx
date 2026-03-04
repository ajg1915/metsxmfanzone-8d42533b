import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTeamAbbreviation } from "./GamecastTicker";
import { useState } from "react";

interface BoxScoreProps {
  gameData: {
    teams: {
      away: { team: { id: number; name: string } };
      home: { team: { id: number; name: string } };
    };
  };
  boxScore: any;
}

function TeamBoxScore({ boxScore, side }: { boxScore: any; side: 'away' | 'home' }) {
  const teamData = boxScore?.teams?.[side];
  const batters = teamData?.batters || [];
  const pitchers = teamData?.pitchers || [];
  const players = teamData?.players || {};

  if (!teamData) {
    return (
      <div className="text-center text-muted-foreground py-8 text-xs">
        Box score available once the game starts
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Batters */}
      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Batters</div>
        <div className="overflow-x-auto rounded-lg border border-border/10">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-muted/10 border-b border-border/10">
                <th className="text-left p-2 sticky left-0 bg-card/95 backdrop-blur-sm z-10 font-bold text-muted-foreground">Player</th>
                <th className="text-center p-1.5 w-7 font-bold text-muted-foreground">AB</th>
                <th className="text-center p-1.5 w-7 font-bold text-muted-foreground">R</th>
                <th className="text-center p-1.5 w-7 font-bold text-muted-foreground">H</th>
                <th className="text-center p-1.5 w-7 font-bold text-muted-foreground">RBI</th>
                <th className="text-center p-1.5 w-7 font-bold text-muted-foreground">BB</th>
                <th className="text-center p-1.5 w-7 font-bold text-muted-foreground">SO</th>
                <th className="text-center p-1.5 w-10 font-bold text-muted-foreground">AVG</th>
              </tr>
            </thead>
            <tbody>
              {batters.slice(0, 12).map((batterId: number, idx: number) => {
                const player = players[`ID${batterId}`];
                const stats = player?.stats?.batting;
                if (!player) return null;
                return (
                  <tr key={batterId} className={`border-t border-border/5 transition-colors hover:bg-muted/8 ${idx % 2 === 0 ? '' : 'bg-muted/3'}`}>
                    <td className="p-2 sticky left-0 bg-card/95 backdrop-blur-sm z-10">
                      <span className="text-muted-foreground/40 mr-1 font-mono text-[10px]">{idx + 1}.</span>
                      <span className="font-bold">{player?.person?.fullName?.split(' ').pop()}</span>
                      <span className="text-muted-foreground/40 ml-1 text-[9px] font-bold">{player?.position?.abbreviation}</span>
                    </td>
                    <td className="text-center p-1.5 font-mono">{stats?.atBats ?? 0}</td>
                    <td className="text-center p-1.5 font-mono">{stats?.runs ?? 0}</td>
                    <td className={`text-center p-1.5 font-mono font-bold ${(stats?.hits || 0) > 0 ? 'text-green-400' : ''}`}>{stats?.hits ?? 0}</td>
                    <td className={`text-center p-1.5 font-mono font-bold ${(stats?.rbi || 0) > 0 ? 'text-primary' : ''}`}>{stats?.rbi ?? 0}</td>
                    <td className="text-center p-1.5 font-mono">{stats?.baseOnBalls ?? 0}</td>
                    <td className="text-center p-1.5 font-mono">{stats?.strikeOuts ?? 0}</td>
                    <td className="text-center p-1.5 font-mono text-muted-foreground/60">{stats?.avg || '.000'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pitchers */}
      {pitchers.length > 0 && (
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Pitchers</div>
          <div className="overflow-x-auto rounded-lg border border-border/10">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-muted/10 border-b border-border/10">
                  <th className="text-left p-2 sticky left-0 bg-card/95 backdrop-blur-sm z-10 font-bold text-muted-foreground">Pitcher</th>
                  <th className="text-center p-1.5 w-7 font-bold text-muted-foreground">IP</th>
                  <th className="text-center p-1.5 w-7 font-bold text-muted-foreground">H</th>
                  <th className="text-center p-1.5 w-7 font-bold text-muted-foreground">R</th>
                  <th className="text-center p-1.5 w-7 font-bold text-muted-foreground">ER</th>
                  <th className="text-center p-1.5 w-7 font-bold text-muted-foreground">BB</th>
                  <th className="text-center p-1.5 w-7 font-bold text-muted-foreground">K</th>
                  <th className="text-center p-1.5 w-10 font-bold text-muted-foreground">ERA</th>
                </tr>
              </thead>
              <tbody>
                {pitchers.map((pitcherId: number, idx: number) => {
                  const player = players[`ID${pitcherId}`];
                  const stats = player?.stats?.pitching;
                  if (!player || !stats?.inningsPitched) return null;
                  return (
                    <tr key={pitcherId} className={`border-t border-border/5 transition-colors hover:bg-muted/8 ${idx % 2 === 0 ? '' : 'bg-muted/3'}`}>
                      <td className="p-2 font-bold sticky left-0 bg-card/95 backdrop-blur-sm z-10">{player?.person?.fullName?.split(' ').pop()}</td>
                      <td className="text-center p-1.5 font-mono">{stats?.inningsPitched || '0'}</td>
                      <td className="text-center p-1.5 font-mono">{stats?.hits ?? 0}</td>
                      <td className="text-center p-1.5 font-mono">{stats?.runs ?? 0}</td>
                      <td className="text-center p-1.5 font-mono">{stats?.earnedRuns ?? 0}</td>
                      <td className="text-center p-1.5 font-mono">{stats?.baseOnBalls ?? 0}</td>
                      <td className={`text-center p-1.5 font-mono font-bold ${(stats?.strikeOuts || 0) >= 5 ? 'text-red-400' : ''}`}>{stats?.strikeOuts ?? 0}</td>
                      <td className="text-center p-1.5 font-mono text-muted-foreground/60">{stats?.era || '0.00'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GamecastBoxScore({ gameData, boxScore }: BoxScoreProps) {
  const [activeTab, setActiveTab] = useState<'away' | 'home'>('home');

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
        <TeamBoxScore boxScore={boxScore} side="away" />
      </TabsContent>
      <TabsContent value="home">
        <TeamBoxScore boxScore={boxScore} side="home" />
      </TabsContent>
    </Tabs>
  );
}
