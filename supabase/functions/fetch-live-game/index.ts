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

    // Step 1: Get today's schedule to find the gamePk
    const scheduleUrl = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${METS_TEAM_ID}&date=${todayET}`;
    const scheduleRes = await fetch(scheduleUrl, {
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });

    if (!scheduleRes.ok) {
      return new Response(JSON.stringify({ game: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const scheduleData = await scheduleRes.json();

    if (!scheduleData.dates || scheduleData.dates.length === 0 || scheduleData.dates[0].games.length === 0) {
      return new Response(JSON.stringify({ game: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const scheduledGame = scheduleData.dates[0].games[0];
    const gamePk = scheduledGame.gamePk;
    const abstractState = scheduledGame.status?.abstractGameState;

    // For Preview (not started) games, return the scheduled time
    if (abstractState === 'Preview') {
      const gameTime = new Date(scheduledGame.gameDate).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
        timeZoneName: 'short',
      });
      return new Response(JSON.stringify({
        game: {
          homeTeam: scheduledGame.teams.home.team.name,
          awayTeam: scheduledGame.teams.away.team.name,
          homeScore: 0,
          awayScore: 0,
          inning: '',
          inningState: '',
          isLive: false,
          gameStatus: gameTime,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 2: For Live or Final games, use the live feed for the most real-time data
    const liveFeedUrl = `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`;
    const liveRes = await fetch(liveFeedUrl, {
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });

    if (!liveRes.ok) {
      return new Response(JSON.stringify({ game: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const liveData = await liveRes.json();
    const gameData = liveData.gameData;
    const linescore = liveData.liveData?.linescore;
    const status = gameData?.status;

    const isLive = status?.abstractGameState === 'Live';
    const isFinal = status?.abstractGameState === 'Final';

    if (!isLive && !isFinal) {
      return new Response(JSON.stringify({ game: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const homeTeam = gameData.teams.home.name;
    const awayTeam = gameData.teams.away.name;
    const homeScore = linescore?.teams?.home?.runs ?? 0;
    const awayScore = linescore?.teams?.away?.runs ?? 0;
    const currentInning = linescore?.currentInning ?? '';
    const inningState = linescore?.inningState ?? '';
    const outs = linescore?.outs ?? 0;

    let gameStatus = '';
    if (isFinal) {
      gameStatus = currentInning > 9 ? `Final (${currentInning})` : 'Final';
    } else {
      gameStatus = `${inningState} ${currentInning} · ${outs} out${outs !== 1 ? 's' : ''}`;
    }

    return new Response(JSON.stringify({
      game: {
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        inning: currentInning.toString(),
        inningState,
        isLive,
        gameStatus,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching live game:', error);
    return new Response(JSON.stringify({ game: null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});