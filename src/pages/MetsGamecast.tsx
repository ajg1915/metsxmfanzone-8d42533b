import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import GamecastTicker from "@/components/gamecast/GamecastTicker";
import GamecastScoreboard from "@/components/gamecast/GamecastScoreboard";
import GamecastLineScore from "@/components/gamecast/GamecastLineScore";
import GamecastBoxScore from "@/components/gamecast/GamecastBoxScore";
import GamecastPlays, { type PlayEvent } from "@/components/gamecast/GamecastPlays";

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

interface OtherGame {
  gamePk: number;
  teams: {
    away: { team: { id: number; name: string }; score?: number };
    home: { team: { id: number; name: string }; score?: number };
  };
  status: { abstractGameState: string; detailedState: string };
}

const getSampleGameData = (): GameData => ({
  gamePk: 0,
  gameDate: new Date().toISOString(),
  status: { abstractGameState: 'Preview', detailedState: 'Scheduled', statusCode: 'S' },
  teams: {
    away: { team: { id: 144, name: 'Atlanta Braves' }, score: 0 },
    home: { team: { id: 121, name: 'New York Mets' }, score: 0 },
  },
  linescore: {
    currentInning: 1, currentInningOrdinal: '1st', inningState: 'Top',
    innings: [], offense: { first: false, second: false, third: false },
    balls: 0, strikes: 0, outs: 0,
  },
  venue: { name: 'Citi Field' },
});

const MetsGamecast = () => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [boxScore, setBoxScore] = useState<any>(null);
  const [plays, setPlays] = useState<PlayEvent[]>([]);
  const [otherGames, setOtherGames] = useState<OtherGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [metsRes, allRes] = await Promise.all([
          fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=121&date=${today}&hydrate=linescore,team,venue`),
          fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}&hydrate=team,linescore`),
        ]);
        const [metsData, allData] = await Promise.all([metsRes.json(), allRes.json()]);

        if (allData.dates?.[0]?.games) {
          setOtherGames(allData.dates[0].games.filter((g: any) => g.teams.away.team.id !== 121 && g.teams.home.team.id !== 121));
        }

        if (metsData.dates?.[0]?.games?.[0]) {
          const game = metsData.dates[0].games[0];
          setGameData(game);

          if (game.status.abstractGameState !== 'Preview') {
            const liveRes = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${game.gamePk}/feed/live`);
            const liveData = await liveRes.json();
            setBoxScore(liveData.liveData?.boxscore);

            // Extract play-by-play
            const allPlays = liveData.liveData?.plays?.allPlays || [];
            const completedPlays: PlayEvent[] = allPlays
              .filter((p: any) => p.about?.isComplete)
              .map((p: any) => ({
                result: {
                  description: p.result?.description || '',
                  event: p.result?.event || '',
                  eventType: p.result?.eventType || '',
                  rbi: p.result?.rbi || 0,
                  awayScore: p.result?.awayScore,
                  homeScore: p.result?.homeScore,
                },
                about: {
                  atBatIndex: p.about?.atBatIndex || 0,
                  halfInning: p.about?.halfInning || 'top',
                  inning: p.about?.inning || 1,
                  isComplete: true,
                  isScoringPlay: p.about?.isScoringPlay || false,
                },
                matchup: {
                  batter: p.matchup?.batter ? { fullName: p.matchup.batter.fullName } : undefined,
                  pitcher: p.matchup?.pitcher ? { fullName: p.matchup.pitcher.fullName } : undefined,
                },
              }));
            setPlays(completedPlays);
          }
        } else {
          setGameData(getSampleGameData());
        }
      } catch (error) {
        console.error('Error fetching game data:', error);
        setGameData(getSampleGameData());
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-3 py-8 pt-14 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Mets Gamecast - Live Game Updates | MetsXMFanZone</title>
        <meta name="description" content="Follow New York Mets games live with real-time scores, play-by-play, and box scores." />
      </Helmet>
      <Navigation />

      <main className="flex-1 pt-12">
        <GamecastTicker games={otherGames} />

        <div className="flex flex-col lg:flex-row">
          {/* Main content */}
          <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4">
            {gameData && <GamecastScoreboard gameData={gameData} />}
            {gameData && <GamecastLineScore gameData={gameData} />}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-border/50 bg-muted/5 p-3 sm:p-4 pb-20 sm:pb-4">
            <Tabs defaultValue="plays" className="w-full">
              <TabsList className="w-full mb-3">
                <TabsTrigger value="plays" className="flex-1 text-xs">PLAYS</TabsTrigger>
                <TabsTrigger value="box" className="flex-1 text-xs">BOX SCORE</TabsTrigger>
              </TabsList>
              <TabsContent value="plays">
                <GamecastPlays plays={plays} />
              </TabsContent>
              <TabsContent value="box">
                {gameData && <GamecastBoxScore gameData={gameData} boxScore={boxScore} />}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MetsGamecast;
