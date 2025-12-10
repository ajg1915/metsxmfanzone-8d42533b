import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
interface GameData {
  gamePk: number;
  gameDate: string;
  status: {
    abstractGameState: string;
    detailedState: string;
    statusCode: string;
  };
  teams: {
    away: {
      team: {
        id: number;
        name: string;
      };
      score?: number;
    };
    home: {
      team: {
        id: number;
        name: string;
      };
      score?: number;
    };
  };
  linescore?: {
    currentInning?: number;
    currentInningOrdinal?: string;
    inningState?: string;
    innings?: Array<{
      num: number;
      home?: {
        runs?: number;
      };
      away?: {
        runs?: number;
      };
    }>;
    offense?: {
      batter?: {
        id: number;
        fullName: string;
      };
      onDeck?: {
        id: number;
        fullName: string;
      };
      inHole?: {
        id: number;
        fullName: string;
      };
      first?: boolean;
      second?: boolean;
      third?: boolean;
    };
    defense?: {
      pitcher?: {
        id: number;
        fullName: string;
      };
    };
    balls?: number;
    strikes?: number;
    outs?: number;
  };
  venue?: {
    name: string;
  };
}
interface BoxScorePlayer {
  person: {
    id: number;
    fullName: string;
  };
  position: {
    abbreviation: string;
  };
  stats: {
    batting?: {
      atBats?: number;
      runs?: number;
      hits?: number;
      rbi?: number;
      baseOnBalls?: number;
      strikeOuts?: number;
      leftOnBase?: number;
      avg?: string;
      ops?: string;
    };
    pitching?: {
      inningsPitched?: string;
      hits?: number;
      runs?: number;
      earnedRuns?: number;
      baseOnBalls?: number;
      strikeOuts?: number;
      homeRuns?: number;
      era?: string;
    };
  };
}
interface OtherGame {
  gamePk: number;
  teams: {
    away: {
      team: {
        id: number;
        name: string;
        abbreviation?: string;
      };
      score?: number;
    };
    home: {
      team: {
        id: number;
        name: string;
        abbreviation?: string;
      };
      score?: number;
    };
  };
  status: {
    abstractGameState: string;
    detailedState: string;
  };
}
const MetsGamecast = () => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [boxScore, setBoxScore] = useState<any>(null);
  const [otherGames, setOtherGames] = useState<OtherGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTeamTab, setActiveTeamTab] = useState<'away' | 'home'>('home');
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Fetch Mets game
        const metsResponse = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=121&date=${today}&hydrate=linescore,team,venue`);
        const metsData = await metsResponse.json();

        // Fetch all MLB games for ticker
        const allGamesResponse = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}&hydrate=team,linescore`);
        const allGamesData = await allGamesResponse.json();
        if (allGamesData.dates?.[0]?.games) {
          setOtherGames(allGamesData.dates[0].games.filter((g: any) => g.teams.away.team.id !== 121 && g.teams.home.team.id !== 121));
        }
        if (metsData.dates?.[0]?.games?.[0]) {
          const game = metsData.dates[0].games[0];
          setGameData(game);

          // Fetch box score if game is in progress or final
          if (game.status.abstractGameState !== 'Preview') {
            const boxResponse = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${game.gamePk}/feed/live`);
            const boxData = await boxResponse.json();
            setBoxScore(boxData.liveData?.boxscore);
          }
        } else {
          // No game today - show sample data
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
    const interval = setInterval(fetchGameData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);
  const getSampleGameData = (): GameData => ({
    gamePk: 0,
    gameDate: new Date().toISOString(),
    status: {
      abstractGameState: 'Preview',
      detailedState: 'Scheduled',
      statusCode: 'S'
    },
    teams: {
      away: {
        team: {
          id: 144,
          name: 'Atlanta Braves'
        },
        score: 0
      },
      home: {
        team: {
          id: 121,
          name: 'New York Mets'
        },
        score: 0
      }
    },
    linescore: {
      currentInning: 1,
      currentInningOrdinal: '1st',
      inningState: 'Top',
      innings: [],
      offense: {
        first: false,
        second: false,
        third: false
      },
      balls: 0,
      strikes: 0,
      outs: 0
    },
    venue: {
      name: 'Citi Field'
    }
  });
  const getTeamAbbreviation = (name: string): string => {
    const abbrevs: Record<string, string> = {
      'New York Mets': 'NYM',
      'Atlanta Braves': 'ATL',
      'Philadelphia Phillies': 'PHI',
      'Miami Marlins': 'MIA',
      'Washington Nationals': 'WSH',
      'Los Angeles Dodgers': 'LAD',
      'San Diego Padres': 'SD',
      'San Francisco Giants': 'SF',
      'Arizona Diamondbacks': 'ARI',
      'Colorado Rockies': 'COL',
      'Chicago Cubs': 'CHC',
      'Milwaukee Brewers': 'MIL',
      'St. Louis Cardinals': 'STL',
      'Pittsburgh Pirates': 'PIT',
      'Cincinnati Reds': 'CIN',
      'New York Yankees': 'NYY',
      'Boston Red Sox': 'BOS',
      'Tampa Bay Rays': 'TB',
      'Toronto Blue Jays': 'TOR',
      'Baltimore Orioles': 'BAL',
      'Cleveland Guardians': 'CLE',
      'Detroit Tigers': 'DET',
      'Chicago White Sox': 'CHW',
      'Minnesota Twins': 'MIN',
      'Kansas City Royals': 'KC',
      'Houston Astros': 'HOU',
      'Texas Rangers': 'TEX',
      'Seattle Mariners': 'SEA',
      'Oakland Athletics': 'OAK',
      'Los Angeles Angels': 'LAA'
    };
    return abbrevs[name] || name.substring(0, 3).toUpperCase();
  };
  const renderBaseDiamond = () => {
    const offense = gameData?.linescore?.offense;
    return <div className="relative w-12 h-12">
        {/* Second base */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-2 ${offense?.second ? 'bg-yellow-400 border-yellow-500' : 'bg-muted border-muted-foreground/30'}`} />
        {/* Third base */}
        <div className={`absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 rotate-45 border-2 ${offense?.third ? 'bg-yellow-400 border-yellow-500' : 'bg-muted border-muted-foreground/30'}`} />
        {/* First base */}
        <div className={`absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 rotate-45 border-2 ${offense?.first ? 'bg-yellow-400 border-yellow-500' : 'bg-muted border-muted-foreground/30'}`} />
      </div>;
  };
  const renderCount = () => {
    const balls = gameData?.linescore?.balls || 0;
    const strikes = gameData?.linescore?.strikes || 0;
    return <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">B</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i < balls ? 'bg-green-500' : 'bg-muted'}`} />)}
        </div>
        <span className="text-muted-foreground ml-2">S</span>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i < strikes ? 'bg-red-500' : 'bg-muted'}`} />)}
        </div>
      </div>;
  };
  const renderOuts = () => {
    const outs = gameData?.linescore?.outs || 0;
    return <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">OUT</span>
        {[0, 1, 2].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i < outs ? 'bg-orange-500' : 'bg-muted'}`} />)}
      </div>;
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8 pt-20">
          <Skeleton className="h-96 w-full" />
        </main>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Mets Gamecast - Live Game Updates | MetsXMFanZone</title>
        <meta name="description" content="Follow New York Mets games live with real-time scores, play-by-play, and box scores." />
      </Helmet>
      <Navigation />
      
      <main className="flex-1 pt-16">
        {/* Games Ticker */}
        <div className="bg-black/90 border-b border-border">
          <ScrollArea className="w-full">
            <div className="flex items-center gap-1 p-2 min-w-max">
              {otherGames.slice(0, 12).map(game => <div key={game.gamePk} className="flex-shrink-0 bg-muted/30 rounded px-3 py-1 text-xs">
                  <div className="flex items-center gap-2">
                    <img src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} alt="" className="w-4 h-4" />
                    <span className="text-muted-foreground">{getTeamAbbreviation(game.teams.away.team.name)}</span>
                    <span className="font-bold">{game.teams.away.score ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} alt="" className="w-4 h-4" />
                    <span className="text-muted-foreground">{getTeamAbbreviation(game.teams.home.team.name)}</span>
                    <span className="font-bold">{game.teams.home.score ?? '-'}</span>
                  </div>
                  <div className="text-center text-[10px] text-muted-foreground mt-1">
                    {game.status.detailedState}
                  </div>
                </div>)}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Main Game Area */}
          <div className="flex-1 p-4">
            {/* Game Status Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge variant={gameData?.status.abstractGameState === 'Live' ? 'destructive' : 'secondary'}>
                  {gameData?.status.detailedState}
                </Badge>
                <span className="text-sm text-muted-foreground">{gameData?.venue?.name}</span>
              </div>
              {gameData?.linescore?.currentInningOrdinal && <span className="text-lg font-bold">
                  {gameData.linescore.inningState} {gameData.linescore.currentInningOrdinal}
                </span>}
            </div>

            {/* Scoreboard */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-3">
              <CardContent className="p-2 sm:p-3">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-1 sm:gap-3 items-center">
                  {/* Away Team */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <img src={`https://www.mlbstatic.com/team-logos/${gameData?.teams.away.team.id}.svg`} alt={gameData?.teams.away.team.name} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                    <div>
                      <div className="text-[10px] sm:text-xs font-bold truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">{gameData?.teams.away.team.name}</div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold">{gameData?.teams.away.score ?? 0}</div>
                    </div>
                  </div>

                  {/* Center Info */}
                  <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 scale-75 sm:scale-90 md:scale-100 mx-auto">
                    {renderBaseDiamond()}
                    {renderCount()}
                    {renderOuts()}
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
                    <div className="text-right">
                      <div className="text-[10px] sm:text-xs font-bold truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">{gameData?.teams.home.team.name}</div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold">{gameData?.teams.home.score ?? 0}</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <img src={`https://www.mlbstatic.com/team-logos/${gameData?.teams.home.team.id}.svg`} alt={gameData?.teams.home.team.name} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                      {gameData?.teams.home.team.id === 121 && <Link to="/metsxmfanzone-tv" className="sm:text-xs font-semibold text-primary hover:text-primary/80 mt-0.5 animate-pulse text-xs font-sans text-center">
                          WATCH Live
                        </Link>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Score */}
            <Card className="mb-4 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="p-2 text-left w-32">Team</th>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <th key={i} className="p-2 text-center w-8">{i}</th>)}
                        <th className="p-2 text-center w-10 font-bold">R</th>
                        <th className="p-2 text-center w-10">H</th>
                        <th className="p-2 text-center w-10">E</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="p-2 flex items-center gap-2">
                          <img src={`https://www.mlbstatic.com/team-logos/${gameData?.teams.away.team.id}.svg`} alt="" className="w-5 h-5" />
                          {getTeamAbbreviation(gameData?.teams.away.team.name || '')}
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
                        const inning = gameData?.linescore?.innings?.find(inn => inn.num === i);
                        return <td key={i} className="p-2 text-center text-muted-foreground">
                              {inning?.away?.runs ?? '-'}
                            </td>;
                      })}
                        <td className="p-2 text-center font-bold">{gameData?.teams.away.score ?? 0}</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center">-</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-2 flex items-center gap-2">
                          <img src={`https://www.mlbstatic.com/team-logos/${gameData?.teams.home.team.id}.svg`} alt="" className="w-5 h-5" />
                          {getTeamAbbreviation(gameData?.teams.home.team.name || '')}
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
                        const inning = gameData?.linescore?.innings?.find(inn => inn.num === i);
                        return <td key={i} className="p-2 text-center text-muted-foreground">
                              {inning?.home?.runs ?? '-'}
                            </td>;
                      })}
                        <td className="p-2 text-center font-bold">{gameData?.teams.home.score ?? 0}</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Current At Bat Info */}
            {gameData?.status.abstractGameState === 'Live' && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">AT BAT</div>
                    <div className="font-bold">{gameData?.linescore?.offense?.batter?.fullName || 'TBD'}</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">PITCHING</div>
                    <div className="font-bold">{gameData?.linescore?.defense?.pitcher?.fullName || 'TBD'}</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">ON DECK</div>
                    <div className="font-bold">{gameData?.linescore?.offense?.onDeck?.fullName || 'TBD'}</div>
                  </CardContent>
                </Card>
              </div>}
          </div>

          {/* Box Score Sidebar */}
          <div className="w-full lg:w-96 border-l border-border bg-muted/10 p-4">
            <Tabs defaultValue="box" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="box" className="flex-1">BOX</TabsTrigger>
                <TabsTrigger value="plays" className="flex-1">PLAYS</TabsTrigger>
              </TabsList>
              
              <TabsContent value="box">
                <Tabs value={activeTeamTab} onValueChange={v => setActiveTeamTab(v as 'away' | 'home')}>
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="away" className="flex-1">
                      {getTeamAbbreviation(gameData?.teams.away.team.name || 'Away')}
                    </TabsTrigger>
                    <TabsTrigger value="home" className="flex-1">
                      {getTeamAbbreviation(gameData?.teams.home.team.name || 'Home')}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="away">
                    <BoxScoreTable teamId={gameData?.teams.away.team.id} boxScore={boxScore} side="away" />
                  </TabsContent>
                  <TabsContent value="home">
                    <BoxScoreTable teamId={gameData?.teams.home.team.id} boxScore={boxScore} side="home" />
                  </TabsContent>
                </Tabs>
              </TabsContent>
              
              <TabsContent value="plays">
                <div className="text-center text-muted-foreground py-8">
                  Play-by-play updates will appear here during live games
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>;
};
const BoxScoreTable = ({
  teamId,
  boxScore,
  side
}: {
  teamId?: number;
  boxScore: any;
  side: 'away' | 'home';
}) => {
  const teamData = boxScore?.teams?.[side];
  const batters = teamData?.batters || [];
  const players = teamData?.players || {};
  if (!teamData) {
    return <div className="text-center text-muted-foreground py-4 text-sm">
        Box score data will be available once the game starts
      </div>;
  }
  return <div className="space-y-4">
      <div className="text-sm font-semibold">Batters</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left p-1">Player</th>
              <th className="text-center p-1">AB</th>
              <th className="text-center p-1">R</th>
              <th className="text-center p-1">H</th>
              <th className="text-center p-1">RBI</th>
              <th className="text-center p-1">BB</th>
              <th className="text-center p-1">SO</th>
              <th className="text-center p-1">AVG</th>
            </tr>
          </thead>
          <tbody>
            {batters.slice(0, 9).map((batterId: number, idx: number) => {
            const player = players[`ID${batterId}`];
            const stats = player?.stats?.batting;
            return <tr key={batterId} className="border-t border-border/50">
                  <td className="p-1 truncate max-w-[100px]">
                    {idx + 1}. {player?.person?.fullName?.split(' ').pop() || 'Player'}
                    <span className="text-muted-foreground ml-1">
                      {player?.position?.abbreviation}
                    </span>
                  </td>
                  <td className="text-center p-1">{stats?.atBats ?? 0}</td>
                  <td className="text-center p-1">{stats?.runs ?? 0}</td>
                  <td className="text-center p-1">{stats?.hits ?? 0}</td>
                  <td className="text-center p-1">{stats?.rbi ?? 0}</td>
                  <td className="text-center p-1">{stats?.baseOnBalls ?? 0}</td>
                  <td className="text-center p-1">{stats?.strikeOuts ?? 0}</td>
                  <td className="text-center p-1">{stats?.avg || '.000'}</td>
                </tr>;
          })}
          </tbody>
        </table>
      </div>
    </div>;
};
export default MetsGamecast;