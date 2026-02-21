import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const METS_TEAM_ID = 121;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get today's date in ET
    const now = new Date();
    const etFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
    const parts = etFormatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')!.value;
    const month = parts.find(p => p.type === 'month')!.value;
    const day = parts.find(p => p.type === 'day')!.value;
    const todayET = `${year}-${month}-${day}`;

    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${METS_TEAM_ID}&date=${todayET}&hydrate=linescore,team`;
    const response = await fetch(url);

    if (!response.ok) {
      return new Response(JSON.stringify({ game: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    if (!data.dates || data.dates.length === 0 || data.dates[0].games.length === 0) {
      return new Response(JSON.stringify({ game: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const game = data.dates[0].games[0];
    const linescore = game.linescore;
    const isLive = game.status.abstractGameState === 'Live';
    const isFinal = game.status.abstractGameState === 'Final';
    const isPreview = game.status.abstractGameState === 'Preview';

    let gameResult = null;

    if (isLive || isFinal) {
      gameResult = {
        homeTeam: game.teams.home.team.name,
        awayTeam: game.teams.away.team.name,
        homeScore: linescore?.teams?.home?.runs || 0,
        awayScore: linescore?.teams?.away?.runs || 0,
        inning: linescore?.currentInning?.toString() || '',
        inningState: linescore?.inningState || '',
        isLive,
        gameStatus: isFinal ? 'Final' : `${linescore?.inningState} ${linescore?.currentInning}`,
      };
    } else if (isPreview) {
      const gameTime = new Date(game.gameDate).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
        timeZoneName: 'short',
      });
      gameResult = {
        homeTeam: game.teams.home.team.name,
        awayTeam: game.teams.away.team.name,
        homeScore: 0,
        awayScore: 0,
        inning: '',
        inningState: '',
        isLive: false,
        gameStatus: gameTime,
      };
    }

    return new Response(JSON.stringify({ game: gameResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching live game:', error);
    return new Response(JSON.stringify({ game: null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
