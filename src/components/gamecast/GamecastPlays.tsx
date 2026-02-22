import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface PlayEvent {
  result: {
    description: string;
    event?: string;
    eventType?: string;
    rbi?: number;
    awayScore?: number;
    homeScore?: number;
  };
  about: {
    atBatIndex: number;
    halfInning: string;
    inning: number;
    isComplete: boolean;
    isScoringPlay?: boolean;
  };
  matchup?: {
    batter?: { fullName: string };
    pitcher?: { fullName: string };
  };
}

function getEventBadgeColor(event?: string): string {
  if (!event) return 'bg-muted/30 text-muted-foreground';
  const e = event.toLowerCase();
  if (e.includes('home_run') || e.includes('homer')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  if (e.includes('strikeout')) return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (e.includes('single') || e.includes('double') || e.includes('triple')) return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (e.includes('walk')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  return 'bg-muted/30 text-muted-foreground';
}

export default function GamecastPlays({ plays }: { plays: PlayEvent[] }) {
  if (!plays.length) {
    return (
      <div className="text-center text-muted-foreground py-8 text-sm">
        <p className="text-lg mb-1">⚾</p>
        <p>Play-by-play updates appear here during live games</p>
      </div>
    );
  }

  // Group by inning
  const grouped = plays.reduce<Record<string, PlayEvent[]>>((acc, play) => {
    const key = `${play.about.halfInning === 'top' ? '▲' : '▼'} ${play.about.inning}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(play);
    return acc;
  }, {});

  const groupKeys = Object.keys(grouped).reverse();

  return (
    <ScrollArea className="h-[400px] sm:h-[500px]">
      <div className="space-y-3 pr-2">
        {groupKeys.map((key) => (
          <div key={key}>
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-1 mb-1.5">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{key}</span>
            </div>
            <div className="space-y-1.5">
              {grouped[key].reverse().map((play, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-2 text-xs border transition-colors ${
                    play.about.isScoringPlay
                      ? 'bg-yellow-500/5 border-yellow-500/20'
                      : 'bg-muted/10 border-border/30 hover:bg-muted/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {play.result.event && (
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 shrink-0 ${getEventBadgeColor(play.result.eventType)}`}>
                        {play.result.event}
                      </Badge>
                    )}
                    <p className="text-muted-foreground leading-relaxed flex-1">
                      {play.result.description}
                    </p>
                  </div>
                  {play.about.isScoringPlay && play.result.awayScore !== undefined && (
                    <div className="mt-1 text-[10px] font-semibold text-yellow-400">
                      Score: {play.result.awayScore} - {play.result.homeScore}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
