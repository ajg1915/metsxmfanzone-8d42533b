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
      <div className="text-center text-muted-foreground py-6 text-xs">
        Box score available once the game starts
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Batters */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Batters</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-muted-foreground border-b border-border/30">
                <th className="text-left p-1 sticky left-0 bg-background z-10">Player</th>
                <th className="text-center p-1 w-7">AB</th>
                <th className="text-center p-1 w-7">R</th>
                <th className="text-center p-1 w-7">H</th>
                <th className="text-center p-1 w-7">RBI</th>
                <th className="text-center p-1 w-7">BB</th>
                <th className="text-center p-1 w-7">SO</th>
                <th className="text-center p-1 w-10">AVG</th>
              </tr>
            </thead>
            <tbody>
              {batters.slice(0, 12).map((batterId: number, idx: number) => {
                const player = players[`ID${batterId}`];
                const stats = player?.stats?.batting;
                if (!player) return null;
                return (
                  <tr key={batterId} className="border-t border-border/20 hover:bg-muted/10">
                    <td className="p-1 sticky left-0 bg-background z-10">
                      <span className="text-muted-foreground mr-1">{idx + 1}.</span>
                      <span className="font-medium">{player?.person?.fullName?.split(' ').pop()}</span>
                      <span className="text-muted-foreground/60 ml-1 text-[9px]">{player?.position?.abbreviation}</span>
                    </td>
                    <td className="text-center p-1 font-mono">{stats?.atBats ?? 0}</td>
                    <td className="text-center p-1 font-mono">{stats?.runs ?? 0}</td>
                    <td className={`text-center p-1 font-mono ${(stats?.hits || 0) > 0 ? 'text-green-400 font-bold' : ''}`}>{stats?.hits ?? 0}</td>
                    <td className={`text-center p-1 font-mono ${(stats?.rbi || 0) > 0 ? 'text-yellow-400 font-bold' : ''}`}>{stats?.rbi ?? 0}</td>
                    <td className="text-center p-1 font-mono">{stats?.baseOnBalls ?? 0}</td>
                    <td className="text-center p-1 font-mono">{stats?.strikeOuts ?? 0}</td>
                    <td className="text-center p-1 font-mono text-muted-foreground">{stats?.avg || '.000'}</td>
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
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Pitchers</div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-muted-foreground border-b border-border/30">
                  <th className="text-left p-1 sticky left-0 bg-background z-10">Pitcher</th>
                  <th className="text-center p-1 w-7">IP</th>
                  <th className="text-center p-1 w-7">H</th>
                  <th className="text-center p-1 w-7">R</th>
                  <th className="text-center p-1 w-7">ER</th>
                  <th className="text-center p-1 w-7">BB</th>
                  <th className="text-center p-1 w-7">K</th>
                  <th className="text-center p-1 w-10">ERA</th>
                </tr>
              </thead>
              <tbody>
                {pitchers.map((pitcherId: number) => {
                  const player = players[`ID${pitcherId}`];
                  const stats = player?.stats?.pitching;
                  if (!player || !stats?.inningsPitched) return null;
                  return (
                    <tr key={pitcherId} className="border-t border-border/20 hover:bg-muted/10">
                      <td className="p-1 font-medium sticky left-0 bg-background z-10">{player?.person?.fullName?.split(' ').pop()}</td>
                      <td className="text-center p-1 font-mono">{stats?.inningsPitched || '0'}</td>
                      <td className="text-center p-1 font-mono">{stats?.hits ?? 0}</td>
                      <td className="text-center p-1 font-mono">{stats?.runs ?? 0}</td>
                      <td className="text-center p-1 font-mono">{stats?.earnedRuns ?? 0}</td>
                      <td className="text-center p-1 font-mono">{stats?.baseOnBalls ?? 0}</td>
                      <td className={`text-center p-1 font-mono ${(stats?.strikeOuts || 0) >= 5 ? 'text-red-400 font-bold' : ''}`}>{stats?.strikeOuts ?? 0}</td>
                      <td className="text-center p-1 font-mono text-muted-foreground">{stats?.era || '0.00'}</td>
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
        <TeamBoxScore boxScore={boxScore} side="away" />
      </TabsContent>
      <TabsContent value="home">
        <TeamBoxScore boxScore={boxScore} side="home" />
      </TabsContent>
    </Tabs>
  );
}
