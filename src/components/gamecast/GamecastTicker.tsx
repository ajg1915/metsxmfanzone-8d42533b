import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface OtherGame {
  gamePk: number;
  teams: {
    away: { team: { id: number; name: string }; score?: number };
    home: { team: { id: number; name: string }; score?: number };
  };
  status: { abstractGameState: string; detailedState: string };
}

const getTeamAbbreviation = (name: string): string => {
  const abbrevs: Record<string, string> = {
    'New York Mets': 'NYM', 'Atlanta Braves': 'ATL', 'Philadelphia Phillies': 'PHI',
    'Miami Marlins': 'MIA', 'Washington Nationals': 'WSH', 'Los Angeles Dodgers': 'LAD',
    'San Diego Padres': 'SD', 'San Francisco Giants': 'SF', 'Arizona Diamondbacks': 'ARI',
    'Colorado Rockies': 'COL', 'Chicago Cubs': 'CHC', 'Milwaukee Brewers': 'MIL',
    'St. Louis Cardinals': 'STL', 'Pittsburgh Pirates': 'PIT', 'Cincinnati Reds': 'CIN',
    'New York Yankees': 'NYY', 'Boston Red Sox': 'BOS', 'Tampa Bay Rays': 'TB',
    'Toronto Blue Jays': 'TOR', 'Baltimore Orioles': 'BAL', 'Cleveland Guardians': 'CLE',
    'Detroit Tigers': 'DET', 'Chicago White Sox': 'CHW', 'Minnesota Twins': 'MIN',
    'Kansas City Royals': 'KC', 'Houston Astros': 'HOU', 'Texas Rangers': 'TEX',
    'Seattle Mariners': 'SEA', 'Oakland Athletics': 'OAK', 'Los Angeles Angels': 'LAA',
  };
  return abbrevs[name] || name.substring(0, 3).toUpperCase();
};

export { getTeamAbbreviation };

export default function GamecastTicker({ games }: { games: OtherGame[] }) {
  if (!games.length) return null;
  return (
    <div className="bg-card/60 backdrop-blur-sm border-b border-border/10">
      <ScrollArea className="w-full">
        <div className="flex items-center gap-1 px-3 py-1.5 min-w-max max-w-[1400px] mx-auto">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-2 shrink-0">Scores</span>
          {games.slice(0, 15).map((game) => {
            const isLive = game.status.abstractGameState === 'Live';
            const isFinal = game.status.abstractGameState === 'Final';
            return (
              <div
                key={game.gamePk}
                className={`flex-shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors ${
                  isLive
                    ? 'bg-red-500/8 border border-red-500/20'
                    : isFinal
                    ? 'bg-muted/15 border border-border/10'
                    : 'bg-muted/8 border border-border/5 opacity-70'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <img src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} alt="" className="w-3.5 h-3.5" />
                  <span className="text-muted-foreground font-bold w-7">{getTeamAbbreviation(game.teams.away.team.name)}</span>
                  <span className="font-black w-4 text-right tabular-nums">{game.teams.away.score ?? '-'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <img src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} alt="" className="w-3.5 h-3.5" />
                  <span className="text-muted-foreground font-bold w-7">{getTeamAbbreviation(game.teams.home.team.name)}</span>
                  <span className="font-black w-4 text-right tabular-nums">{game.teams.home.score ?? '-'}</span>
                </div>
                <div className={`text-center text-[9px] mt-1 font-semibold ${isLive ? 'text-red-400' : 'text-muted-foreground/60'}`}>
                  {game.status.detailedState}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
