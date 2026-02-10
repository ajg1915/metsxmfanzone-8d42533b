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

// Interfaces
interface GameData {
  gamePk: number;
  gameDate: string;
  status: {
    abstractGameState: string;
    detailedState: string;
    statusCode: string;
  };
  teams: {
    away: { team: { id: number; name: string }; score?: number };
    home: { team: { id: number; name: string }; score?: number };
  };
  linescore?: {
    currentInning?: number;
    currentInningOrdinal?: string;
    inningState?: string;
    innings?: Array<{ num: number; home?: { runs?: number }; away?: { runs?: number } }>;
    offense?: {
      batter?: { id: number; fullName: string };
      onDeck?: { id: number; fullName: string };
      inHole?: { id: number; fullName: string };
      first?: boolean;
      second?: boolean;
      third?: boolean;
    };
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
    away: { team: { id: number; name: string; abbreviation?: string }; score?: number };
    home: { team: { id: number; name: string; abbreviation?: string }; score?: number };
  };
  status: { abstractGameState: string; detailedState: string };
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
        const metsResponse = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=121&date=${today}&hydrate=linescore,team,venue`);
        const metsData = await metsResponse.json();
        const allGamesResponse = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}&hydrate=team,linescore`);
        const allGamesData = await allGamesResponse.json();
        if (allGamesData.dates?.[0]?.games) {
          setOtherGames(allGamesData.dates[0].games.filter((g: any) => g.teams.away.team.id !== 121 && g.teams.home.team.id !== 121));
        }
        if (metsData.dates?.[0]?.games?.[0]) {
          const game = metsData.dates[0].games[0];
          setGameData(game);
          if (game.status.abstractGameState !== 'Preview') {
            const boxResponse = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${game.gamePk}/feed/live`);
            const boxData = await boxResponse.json();
            setBoxScore(boxData.liveData?.boxscore);
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

  const getSampleGameData = (): GameData => ({
    gamePk: 0,
    gameDate: new Date().toISOString(),
    status: { abstractGameState: 'Preview', detailedState: 'Scheduled', statusCode: 'S' },
    teams: {
      away: { team: { id: 144, name: 'Atlanta Braves' }, score: 0 },
      home: { team: { id: 121, name: 'New York Mets' }, score: 0 }
    },
    linescore: {
      currentInning: 1, currentInningOrdinal: '1st', inningState: 'Top',
      innings: [], offense: { first: false, second: false, third: false },
      balls: 0, strikes: 0, outs: 0
    },
    venue: { name: 'Citi Field' }
  });

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
      'Seattle Mariners': 'SEA', 'Oakland Athletics': 'OAK', 'Los Angeles Angels': 'LAA'
    };
    return abbrevs[name] || name.substring(0, 3).toUpperCase();
  };

  const renderBaseDiamond = () => {
    const offense = gameData?.linescore?.offense;
    return (
      <div className="relative w-10 h-10 sm:w-12 sm:h-12">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rotate-45 border ${offense?.second ? 'bg-yellow-400 border-yellow-500' : 'bg-muted border-muted-foreground/30'}`} />
        <div className={`absolute top-1/2 left-0 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rotate-45 border ${offense?.third ? 'bg-yellow-400 border-yellow-500' : 'bg-muted border-muted-foreground/30'}`} />
        <div className={`absolute top-1/2 right-0 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rotate-45 border ${offense?.first ? 'bg-yellow-400 border-yellow-500' : 'bg-muted border-muted-foreground/30'}`} />
      </div>
    );
  };

  const renderCount = () => {
    const balls = gameData?.linescore?.balls || 0;
    const strikes = gameData?.linescore?.strikes || 0;
    return (
      <div className="flex items-center gap-1 text-[10px] sm:text-xs">
        <span className="text-muted-foreground">B</span>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3].map(i => <div key={i} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${i < balls ? 'bg-green-500' : 'bg-muted'}`} />)}
        </div>
        <span className="text-muted-foreground ml-1">S</span>
        <div className="flex gap-0.5">
          {[0, 1, 2].map(i => <div key={i} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${i < strikes ? 'bg-red-500' : 'bg-muted'}`} />)}
        </div>
      </div>
    );
  };

  const renderOuts = () => {
    const outs = gameData?.linescore?.outs || 0;
    return (
      <div className="flex items-center gap-0.5">
        <span className="text-[9px] sm:text-xs text-muted-foreground mr-0.5">OUT</span>
        {[0, 1, 2].map(i => <div key={i} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${i < outs ? 'bg-orange-500' : 'bg-muted'}`} />)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 px-2 sm:px-4 py-4 pt-12">
          <Skeleton className="h-48 sm:h-96 w-full rounded-lg" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Mets Game Center - Live Updates | MetsXMFanZone</title>
        <meta name="description" content="Follow New York Mets games live with real-time scores, play-by-play, and box scores." />
      </Helmet>
      <Navigation />

      <main className="flex-1 pt-12">
        {/* Scores Ticker */}
        <div className="bg-black/90 border-b border-border/50">
          <ScrollArea className="w-full">
            <div className="flex items-center gap-1 px-2 py-1.5 min-w-max">
              {otherGames.slice(0, 12).map(game => (
                <div key={game.gamePk} className="flex-shrink-0 bg-white/5 rounded px-2 py-1 text-[10px] sm:text-xs space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <img src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} alt="" className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-muted-foreground w-6 sm:w-8">{getTeamAbbreviation(game.teams.away.team.name)}</span>
                    <span className="font-semibold w-3 text-right">{game.teams.away.score ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <img src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} alt="" className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-muted-foreground w-6 sm:w-8">{getTeamAbbreviation(game.teams.home.team.name)}</span>
                    <span className="font-semibold w-3 text-right">{game.teams.home.score ?? '-'}</span>
                  </div>
                  <div className="text-center text-[8px] sm:text-[10px] text-muted-foreground">{game.status.detailedState}</div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Main Game */}
          <div className="flex-1 p-2 sm:p-4">
            {/* Status Bar */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant={gameData?.status.abstractGameState === 'Live' ? 'destructive' : 'secondary'} className="text-[10px] sm:text-xs px-1.5 py-0.5">
                  {gameData?.status.detailedState}
                </Badge>
                <span className="text-[10px] sm:text-xs text-muted-foreground">{gameData?.venue?.name}</span>
              </div>
              {gameData?.linescore?.currentInningOrdinal && (
                <span className="text-xs sm:text-sm font-bold">
                  {gameData.linescore.inningState} {gameData.linescore.currentInningOrdinal}
                </span>
              )}
            </div>

            {/* Scoreboard */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-2">
              <CardContent className="p-2">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-1 items-center">
                  {/* Away */}
                  <div className="flex items-center gap-1.5">
                    <img src={`https://www.mlbstatic.com/team-logos/${gameData?.teams.away.team.id}.svg`} alt={gameData?.teams.away.team.name} className="w-7 h-7 sm:w-10 sm:h-10" />
                    <div>
                      <div className="text-[10px] sm:text-xs font-semibold truncate max-w-[50px] sm:max-w-none">{getTeamAbbreviation(gameData?.teams.away.team.name || '')}</div>
                      <div className="text-lg sm:text-2xl font-bold leading-none">{gameData?.teams.away.score ?? 0}</div>
                    </div>
                  </div>

                  {/* Center */}
                  <div className="flex flex-col items-center gap-0.5 mx-1">
                    {renderBaseDiamond()}
                    {renderCount()}
                    {renderOuts()}
                  </div>

                  {/* Home */}
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className="text-right">
                      <div className="text-[10px] sm:text-xs font-semibold truncate max-w-[50px] sm:max-w-none">{getTeamAbbreviation(gameData?.teams.home.team.name || '')}</div>
                      <div className="text-lg sm:text-2xl font-bold leading-none">{gameData?.teams.home.score ?? 0}</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <img src={`https://www.mlbstatic.com/team-logos/${gameData?.teams.home.team.id}.svg`} alt={gameData?.teams.home.team.name} className="w-7 h-7 sm:w-10 sm:h-10" />
                      {gameData?.teams.home.team.id === 121 && (
                        <Link to="/metsxmfanzone-tv" className="text-[9px] sm:text-xs font-semibold text-primary hover:text-primary/80 animate-pulse">
                          WATCH
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Score */}
            <Card className="mb-2 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] sm:text-xs">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="p-1 sm:p-1.5 text-left w-12 sm:w-20">Team</th>
                        {[1,2,3,4,5,6,7,8,9].map(i => <th key={i} className="p-0.5 sm:p-1 text-center w-5 sm:w-7">{i}</th>)}
                        <th className="p-0.5 sm:p-1 text-center font-bold w-5 sm:w-8">R</th>
                        <th className="p-0.5 sm:p-1 text-center w-5 sm:w-8">H</th>
                        <th className="p-0.5 sm:p-1 text-center w-5 sm:w-8">E</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['away', 'home'].map(side => {
                        const team = side === 'away' ? gameData?.teams.away : gameData?.teams.home;
                        return (
                          <tr key={side} className="border-t border-border/50">
                            <td className="p-1 sm:p-1.5 flex items-center gap-1">
                              <img src={`https://www.mlbstatic.com/team-logos/${team?.team.id}.svg`} alt="" className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="font-medium">{getTeamAbbreviation(team?.team.name || '')}</span>
                            </td>
                            {[1,2,3,4,5,6,7,8,9].map(i => {
                              const inning = gameData?.linescore?.innings?.find(inn => inn.num === i);
                              const runs = side === 'away' ? inning?.away?.runs : inning?.home?.runs;
                              return <td key={i} className="p-0.5 sm:p-1 text-center text-muted-foreground">{runs ?? '-'}</td>;
                            })}
                            <td className="p-0.5 sm:p-1 text-center font-bold">{team?.score ?? 0}</td>
                            <td className="p-0.5 sm:p-1 text-center">-</td>
                            <td className="p-0.5 sm:p-1 text-center">-</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* At Bat Info */}
            {gameData?.status.abstractGameState === 'Live' && (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {[
                  { label: 'AT BAT', value: gameData?.linescore?.offense?.batter?.fullName },
                  { label: 'PITCHING', value: gameData?.linescore?.defense?.pitcher?.fullName },
                  { label: 'ON DECK', value: gameData?.linescore?.offense?.onDeck?.fullName },
                ].map(item => (
                  <Card key={item.label} className="bg-muted/20">
                    <CardContent className="p-1.5 sm:p-3 text-center">
                      <div className="text-[8px] sm:text-[10px] text-muted-foreground">{item.label}</div>
                      <div className="text-[10px] sm:text-xs font-semibold truncate">{item.value || 'TBD'}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Box Score Panel */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border/50 bg-muted/5 p-2 sm:p-3">
            <Tabs defaultValue="box" className="w-full">
              <TabsList className="w-full mb-2 h-7 sm:h-8">
                <TabsTrigger value="box" className="flex-1 text-[10px] sm:text-xs h-6 sm:h-7">BOX</TabsTrigger>
                <TabsTrigger value="plays" className="flex-1 text-[10px] sm:text-xs h-6 sm:h-7">PLAYS</TabsTrigger>
              </TabsList>

              <TabsContent value="box">
                <Tabs value={activeTeamTab} onValueChange={v => setActiveTeamTab(v as 'away' | 'home')}>
                  <TabsList className="w-full mb-2 h-7 sm:h-8">
                    <TabsTrigger value="away" className="flex-1 text-[10px] sm:text-xs h-6 sm:h-7">
                      {getTeamAbbreviation(gameData?.teams.away.team.name || 'Away')}
                    </TabsTrigger>
                    <TabsTrigger value="home" className="flex-1 text-[10px] sm:text-xs h-6 sm:h-7">
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
                <div className="text-center text-muted-foreground py-6 text-[10px] sm:text-xs">
                  Play-by-play updates appear during live games
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const BoxScoreTable = ({ teamId, boxScore, side }: { teamId?: number; boxScore: any; side: 'away' | 'home' }) => {
  const teamData = boxScore?.teams?.[side];
  const batters = teamData?.batters || [];
  const players = teamData?.players || {};

  if (!teamData) {
    return <div className="text-center text-muted-foreground py-3 text-[10px] sm:text-xs">Box score available once the game starts</div>;
  }

  return (
    <div className="space-y-2">
      <div className="text-[10px] sm:text-xs font-semibold">Batters</div>
      <div className="overflow-x-auto">
        <table className="w-full text-[9px] sm:text-[11px]">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left p-0.5 sm:p-1">Player</th>
              <th className="text-center p-0.5">AB</th>
              <th className="text-center p-0.5">R</th>
              <th className="text-center p-0.5">H</th>
              <th className="text-center p-0.5">RBI</th>
              <th className="text-center p-0.5">BB</th>
              <th className="text-center p-0.5">SO</th>
              <th className="text-center p-0.5">AVG</th>
            </tr>
          </thead>
          <tbody>
            {batters.slice(0, 9).map((batterId: number, idx: number) => {
              const player = players[`ID${batterId}`];
              const stats = player?.stats?.batting;
              return (
                <tr key={batterId} className="border-t border-border/30">
                  <td className="p-0.5 sm:p-1 truncate max-w-[70px] sm:max-w-[100px]">
                    {idx + 1}. {player?.person?.fullName?.split(' ').pop() || 'Player'}
                    <span className="text-muted-foreground ml-0.5">{player?.position?.abbreviation}</span>
                  </td>
                  <td className="text-center p-0.5">{stats?.atBats ?? 0}</td>
                  <td className="text-center p-0.5">{stats?.runs ?? 0}</td>
                  <td className="text-center p-0.5">{stats?.hits ?? 0}</td>
                  <td className="text-center p-0.5">{stats?.rbi ?? 0}</td>
                  <td className="text-center p-0.5">{stats?.baseOnBalls ?? 0}</td>
                  <td className="text-center p-0.5">{stats?.strikeOuts ?? 0}</td>
                  <td className="text-center p-0.5">{stats?.avg || '.000'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MetsGamecast;
