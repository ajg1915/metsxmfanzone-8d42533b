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

function getEventBadgeStyle(event?: string): string {
  if (!event) return 'bg-muted/20 text-muted-foreground border-border/10';
  const e = event.toLowerCase();
  if (e.includes('home_run') || e.includes('homer')) return 'bg-primary/15 text-primary border-primary/25';
  if (e.includes('strikeout')) return 'bg-red-500/12 text-red-400 border-red-500/20';
  if (e.includes('single') || e.includes('double') || e.includes('triple')) return 'bg-green-500/12 text-green-400 border-green-500/20';
  if (e.includes('walk')) return 'bg-secondary/15 text-secondary border-secondary/20';
  return 'bg-muted/15 text-muted-foreground border-border/10';
}

export default function GamecastPlays({ plays }: { plays: PlayEvent[] }) {
  if (!plays.length) {
    return (
      <div className="text-center py-12">
        <div className="text-3xl mb-2">⚾</div>
        <p className="text-sm text-muted-foreground font-medium">Play-by-play updates appear here during live games</p>
      </div>
    );
  }

  const grouped = plays.reduce<Record<string, PlayEvent[]>>((acc, play) => {
    const key = `${play.about.halfInning === 'top' ? '▲' : '▼'} ${play.about.inning}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(play);
    return acc;
  }, {});

  const groupKeys = Object.keys(grouped).reverse();

  return (
    <ScrollArea className="h-[420px] sm:h-[520px]">
      <div className="space-y-4 pr-2">
        {groupKeys.map((key) => (
          <div key={key}>
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm py-1.5 mb-2 border-b border-border/10">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{key}</span>
            </div>
            <div className="space-y-2">
              {grouped[key].reverse().map((play, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-2.5 text-xs transition-all ${
                    play.about.isScoringPlay
                      ? 'bg-primary/5 border border-primary/15 shadow-[0_0_20px_hsl(16_100%_50%/0.08)]'
                      : 'bg-muted/8 border border-border/5 hover:bg-muted/15'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {play.result.event && (
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 shrink-0 font-bold ${getEventBadgeStyle(play.result.eventType)}`}>
                        {play.result.event}
                      </Badge>
                    )}
                    <p className="text-muted-foreground leading-relaxed flex-1 text-[11px]">
                      {play.result.description}
                    </p>
                  </div>
                  {play.about.isScoringPlay && play.result.awayScore !== undefined && (
                    <div className="mt-1.5 text-[10px] font-black text-primary flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-primary" />
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
