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
    <div className="rounded-xl overflow-hidden glass-card">
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] sm:text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/10">
              <th className="p-2 sm:p-2.5 text-left w-24 sm:w-32 font-black uppercase text-[10px] tracking-wider text-muted-foreground sticky left-0 bg-card/90 backdrop-blur-sm z-10">
                Team
              </th>
              {innings.map(i => (
                <th
                  key={i}
                  className={`p-1.5 sm:p-2 text-center w-7 sm:w-8 font-mono font-bold ${
                    i === gameData.linescore?.currentInning
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {i}
                </th>
              ))}
              <th className="p-1.5 sm:p-2 text-center w-9 sm:w-10 font-black text-foreground bg-muted/15">R</th>
              <th className="p-1.5 sm:p-2 text-center w-9 sm:w-10 font-bold text-muted-foreground bg-muted/15">H</th>
              <th className="p-1.5 sm:p-2 text-center w-9 sm:w-10 font-bold text-muted-foreground bg-muted/15">E</th>
            </tr>
          </thead>
          <tbody>
            {['away', 'home'].map((side, idx) => {
              const team = gameData.teams[side as 'away' | 'home'];
              return (
                <tr
                  key={side}
                  className={`transition-colors hover:bg-muted/5 ${idx === 0 ? 'border-b border-border/5' : ''}`}
                >
                  <td className="p-2 sm:p-2.5 sticky left-0 bg-card/90 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-2">
                      <img src={`https://www.mlbstatic.com/team-logos/${team.team.id}.svg`} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-black text-xs">{getTeamAbbreviation(team.team.name)}</span>
                    </div>
                  </td>
                  {innings.map(i => {
                    const inning = gameData.linescore?.innings?.find(inn => inn.num === i);
                    const runs = inning?.[side as 'away' | 'home']?.runs;
                    return (
                      <td
                        key={i}
                        className={`p-1.5 sm:p-2 text-center font-mono font-bold ${
                          i === gameData.linescore?.currentInning ? 'bg-primary/5' : ''
                        } ${runs !== undefined && runs > 0 ? 'text-primary' : runs !== undefined ? 'text-foreground' : 'text-muted-foreground/25'}`}
                      >
                        {runs ?? '-'}
                      </td>
                    );
                  })}
                  <td className="p-1.5 sm:p-2 text-center font-black text-foreground bg-muted/10 text-sm">{team.score ?? 0}</td>
                  <td className="p-1.5 sm:p-2 text-center text-muted-foreground bg-muted/10">-</td>
                  <td className="p-1.5 sm:p-2 text-center text-muted-foreground bg-muted/10">-</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
