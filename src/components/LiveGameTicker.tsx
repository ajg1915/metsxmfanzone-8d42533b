import { useState, useEffect } from 'react';
import { Activity, Circle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
        const { data, error } = await supabase.functions.invoke('fetch-live-game');

        if (error) throw error;

        if (data?.game) {
          setGameData(data.game);
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
    <div className="bg-gradient-to-r from-primary/90 via-primary to-primary/90 text-primary-foreground py-2 px-4 overflow-hidden my-8 sm:my-10 mx-4 sm:mx-6 lg:mx-8 rounded-xl">
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
