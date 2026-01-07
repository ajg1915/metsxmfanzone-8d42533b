import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MLBGame {
  gamePk: number;
  gameDate: string;
  gameType: string;
  status: {
    detailedState: string;
    abstractGameState: string;
  };
  teams: {
    away: {
      team: { id: number; name: string };
      score?: number;
    };
    home: {
      team: { id: number; name: string };
      score?: number;
    };
  };
  venue: {
    id: number;
    name: string;
  };
  seriesDescription?: string;
  gamesInSeries?: number;
  seriesGameNumber?: number;
}

interface ScheduleResponse {
  dates: Array<{
    date: string;
    games: MLBGame[];
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { year = 2026, gameTypes = ['S', 'R'] } = await req.json().catch(() => ({}));
    
    const METS_TEAM_ID = 121;
    const allGames: any[] = [];

    // Fetch schedule for each game type
    // S = Spring Training, R = Regular Season, P = Postseason
    for (const gameType of gameTypes) {
      let startDate: string;
      let endDate: string;

      if (gameType === 'S') {
        // Spring Training: typically late February to late March
        startDate = `${year}-02-20`;
        endDate = `${year}-03-31`;
      } else if (gameType === 'R') {
        // Regular Season: late March to late September
        startDate = `${year}-03-25`;
        endDate = `${year}-10-05`;
      } else {
        // Postseason: October
        startDate = `${year}-10-01`;
        endDate = `${year}-11-15`;
      }

      const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${METS_TEAM_ID}&startDate=${startDate}&endDate=${endDate}&gameType=${gameType}&hydrate=team,venue`;
      
      console.log(`Fetching ${gameType} games from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Failed to fetch ${gameType} games: ${response.status}`);
        continue;
      }

      const data: ScheduleResponse = await response.json();
      
      if (data.dates) {
        for (const dateEntry of data.dates) {
          for (const game of dateEntry.games) {
            const isHome = game.teams.home.team.id === METS_TEAM_ID;
            const opponent = isHome ? game.teams.away.team : game.teams.home.team;
            
            allGames.push({
              gameId: game.gamePk,
              date: game.gameDate,
              gameType: game.gameType,
              gameTypeLabel: getGameTypeLabel(game.gameType),
              status: game.status.detailedState,
              isHome,
              opponent: opponent.name,
              venue: game.venue.name,
              homeScore: game.teams.home.score,
              awayScore: game.teams.away.score,
              metsScore: isHome ? game.teams.home.score : game.teams.away.score,
              opponentScore: isHome ? game.teams.away.score : game.teams.home.score,
              seriesDescription: game.seriesDescription,
            });
          }
        }
      }
    }

    // Sort games by date
    allGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log(`Total games found: ${allGames.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        games: allGames,
        totalGames: allGames.length,
        year 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching Mets schedule:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function getGameTypeLabel(gameType: string): string {
  switch (gameType) {
    case 'S': return 'Spring Training';
    case 'R': return 'Regular Season';
    case 'P': return 'Postseason';
    case 'F': return 'Wild Card';
    case 'D': return 'Division Series';
    case 'L': return 'League Championship';
    case 'W': return 'World Series';
    default: return gameType;
  }
}
