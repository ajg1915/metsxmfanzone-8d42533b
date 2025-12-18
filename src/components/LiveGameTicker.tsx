import { useState, useEffect } from 'react';
import { Activity, Circle } from 'lucide-react';

interface GameData {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  inning: string;
  inningState: string;
  isLive: boolean;
  gameStatus: string;
}

const LiveGameTicker = () => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveGame = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch Mets schedule for today (team ID 121)
        const response = await fetch(
          `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=121&date=${today}&hydrate=linescore,team`
        );
        
        if (!response.ok) throw new Error('Failed to fetch game data');
        
        const data = await response.json();
        
        if (data.dates && data.dates.length > 0 && data.dates[0].games.length > 0) {
          const game = data.dates[0].games[0];
          const linescore = game.linescore;
          
          const isLive = game.status.abstractGameState === 'Live';
          const isFinal = game.status.abstractGameState === 'Final';
          const isPreview = game.status.abstractGameState === 'Preview';
          
          if (isLive || isFinal) {
            setGameData({
              homeTeam: game.teams.home.team.name,
              awayTeam: game.teams.away.team.name,
              homeScore: linescore?.teams?.home?.runs || 0,
              awayScore: linescore?.teams?.away?.runs || 0,
              inning: linescore?.currentInning?.toString() || '',
              inningState: linescore?.inningState || '',
              isLive,
              gameStatus: isFinal ? 'Final' : `${linescore?.inningState} ${linescore?.currentInning}`
            });
          } else if (isPreview) {
            const gameTime = new Date(game.gameDate).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              timeZoneName: 'short'
            });
            setGameData({
              homeTeam: game.teams.home.team.name,
              awayTeam: game.teams.away.team.name,
              homeScore: 0,
              awayScore: 0,
              inning: '',
              inningState: '',
              isLive: false,
              gameStatus: gameTime
            });
          } else {
            setGameData(null);
          }
        } else {
          setGameData(null);
        }
      } catch (error) {
        console.error('Error fetching live game:', error);
        setGameData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveGame();
    // Refresh every 30 seconds for live updates
    const interval = setInterval(fetchLiveGame, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !gameData) return null;

  const isMetsHome = gameData.homeTeam.includes('Mets');
  const metsScore = isMetsHome ? gameData.homeScore : gameData.awayScore;
  const opponentScore = isMetsHome ? gameData.awayScore : gameData.homeScore;
  const opponent = isMetsHome ? gameData.awayTeam : gameData.homeTeam;

  return (
    <div className="bg-gradient-to-r from-primary/90 via-primary to-primary/90 text-primary-foreground py-2 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm md:text-base">
        {gameData.isLive && (
          <div className="flex items-center gap-1.5 animate-pulse">
            <Circle className="h-2 w-2 fill-red-500 text-red-500" />
            <span className="font-semibold text-red-200">LIVE</span>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 hidden sm:block" />
          
          <div className="flex items-center gap-2 font-bold">
            <span className="text-white">NYM</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-lg">{metsScore}</span>
          </div>
          
          <span className="text-white/60">vs</span>
          
          <div className="flex items-center gap-2 font-bold">
            <span className="text-white/80">{opponent.split(' ').pop()}</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-lg">{opponentScore}</span>
          </div>
          
          <span className="text-white/70 text-xs md:text-sm ml-2 border-l border-border/40 pl-3">
            {gameData.gameStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveGameTicker;
