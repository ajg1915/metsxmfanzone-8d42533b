import { Card, CardContent } from "@/components/ui/card";
import { getTeamAbbreviation } from "./GamecastTicker";

interface LineScoreProps {
  gameData: {
    teams: {
      away: { team: { id: number; name: string }; score?: number };
      home: { team: { id: number; name: string }; score?: number };
    };
    linescore?: {
      currentInning?: number;
      innings?: Array<{ num: number; home?: { runs?: number }; away?: { runs?: number } }>;
    };
  };
}

export default function GamecastLineScore({ gameData }: LineScoreProps) {
  const maxInning = Math.max(9, gameData.linescore?.currentInning || 0);
  const innings = Array.from({ length: maxInning }, (_, i) => i + 1);

  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border/50">
                <th className="p-1.5 sm:p-2 text-left w-24 sm:w-32 font-semibold sticky left-0 bg-muted/40 z-10">Team</th>
                {innings.map(i => (
                  <th key={i} className={`p-1.5 sm:p-2 text-center w-7 sm:w-8 font-mono ${i === gameData.linescore?.currentInning ? 'bg-primary/10 text-primary font-bold' : ''}`}>{i}</th>
                ))}
                <th className="p-1.5 sm:p-2 text-center w-8 sm:w-10 font-bold bg-muted/60">R</th>
                <th className="p-1.5 sm:p-2 text-center w-8 sm:w-10 bg-muted/60">H</th>
                <th className="p-1.5 sm:p-2 text-center w-8 sm:w-10 bg-muted/60">E</th>
              </tr>
            </thead>
            <tbody>
              {['away', 'home'].map((side) => {
                const team = gameData.teams[side as 'away' | 'home'];
                return (
                  <tr key={side} className="border-t border-border/30 hover:bg-muted/10">
                    <td className="p-1.5 sm:p-2 sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-1.5">
                        <img src={`https://www.mlbstatic.com/team-logos/${team.team.id}.svg`} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold">{getTeamAbbreviation(team.team.name)}</span>
                      </div>
                    </td>
                    {innings.map(i => {
                      const inning = gameData.linescore?.innings?.find(inn => inn.num === i);
                      const runs = inning?.[side as 'away' | 'home']?.runs;
                      return (
                        <td key={i} className={`p-1.5 sm:p-2 text-center font-mono ${i === gameData.linescore?.currentInning ? 'bg-primary/5' : ''} ${runs !== undefined ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                          {runs ?? '-'}
                        </td>
                      );
                    })}
                    <td className="p-1.5 sm:p-2 text-center font-bold bg-muted/20">{team.score ?? 0}</td>
                    <td className="p-1.5 sm:p-2 text-center text-muted-foreground bg-muted/20">-</td>
                    <td className="p-1.5 sm:p-2 text-center text-muted-foreground bg-muted/20">-</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
